<?php

namespace Utils;

use Framework\Exceptions\ValidationException;
use Psr\Http\Message\RequestInterface;

// SSRF guards. Every URL fetched on a user's behalf must be validated so it
// cannot target internal addresses (cloud metadata at 169.254.169.254,
// loopback, link-local) or non-http(s) schemes.

/**
 * Whether an IP is routable and public (v4 and v6).
 */
function isPublicIpAddress(string $ip): bool
{
	return filter_var(
			$ip,
			FILTER_VALIDATE_IP,
			FILTER_FLAG_GLOBAL_RANGE
		) !== false;
}

/**
 * Resolve a hostname (or IP literal) to the list of IP addresses it points to.
 *
 * @return string[]
 */
function resolveHostIps(string $host): array
{
	// Memoised per request: resolution blocks with no timeout and the guard runs
	// on every dispatch. Safe because these are the same addresses pinned via
	// CURLOPT_RESOLVE. Statics reset per request on mod_php/FPM - a worker-mode
	// SAPI would need an explicit reset.
	static $cache = [];

	$host = trim($host, '[]'); // strip IPv6 literal brackets
	$key = strtolower($host);  // DNS is case-insensitive

	if (isset($cache[$key])) {
		return $cache[$key];
	}

	if (filter_var($host, FILTER_VALIDATE_IP) !== false) {
		return $cache[$key] = [$host];
	}

	$ips = [];
	$records = @dns_get_record($host, DNS_A | DNS_AAAA);
	if (is_array($records)) {
		foreach ($records as $record) {
			if (!empty($record['ip'])) {
				$ips[] = $record['ip'];
			}
			if (!empty($record['ipv6'])) {
				$ips[] = $record['ipv6'];
			}
		}
	}

	if (empty($ips)) {
		$resolved = gethostbynamel($host);
		if (is_array($resolved)) {
			$ips = $resolved;
		}
	}

	// Failures are cached too: a dead host is the expensive timeout case.
	return $cache[$key] = array_values(array_unique($ips));
}

/**
 * Ensure the URL is http(s) and every IP its host resolves to is public.
 * Returns those IPs so the caller can pin the connection and close the
 * DNS-rebinding window between check and connect.
 *
 * @return string[] resolved public IPs
 * @throws ValidationException when the URL is not allowed
 */
function assertPublicHttpUrl(string $url): array
{
	$parts = parse_url($url);
	if ($parts === false || empty($parts['scheme']) || empty($parts['host'])) {
		throw new ValidationException('Invalid URL', 400);
	}

	if (!in_array(strtolower($parts['scheme']), ['http', 'https'], true)) {
		throw new ValidationException('Only http and https URLs are allowed', 400);
	}

	$ips = resolveHostIps($parts['host']);
	if (empty($ips)) {
		throw new ValidationException('Could not resolve host', 400);
	}

	foreach ($ips as $ip) {
		if (!isPublicIpAddress($ip)) {
			throw new ValidationException('Requests to internal addresses are not allowed', 400);
		}
	}

	return $ips;
}

/**
 * Build the CURLOPT_RESOLVE pin so curl connects to an already-validated
 * address instead of re-resolving the hostname.
 *
 * @param string[] $ips
 * @return string[]
 */
function buildResolvePins(array $parts, array $ips): array
{
	$host = trim($parts['host'], '[]');
	$port = $parts['port'] ?? (strtolower($parts['scheme']) === 'https' ? 443 : 80);
	// One entry only: curl keeps just the first per host:port, so comma-separated
	// alternates are what preserves A/AAAA failover.
	return [sprintf('%s:%s:%s', $host, $port, implode(',', $ips))];
}

/**
 * SSRF guard as Guzzle middleware: rejects non-http(s) schemes and hosts
 * resolving to private IPs, pins the connection to the validated IP, and forces
 * TLS and http(s)-only protocols over any caller-supplied options.
 *
 * Installed *inner* to 'allow_redirects' (see the Client binding in init.php),
 * so it re-runs on every redirect hop rather than only the initial request.
 */
function ssrfGuardMiddleware(): callable
{
	return static function (callable $handler): callable {
		return static function (RequestInterface $request, array $options) use ($handler) {
			$url = (string)$request->getUri();
			$ips = assertPublicHttpUrl($url); // throws on private/invalid
			$parts = parse_url($url);

			$options['verify'] = true;
			$options['curl'] = array_replace($options['curl'] ?? [], [
				CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
				CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
				CURLOPT_RESOLVE => buildResolvePins($parts, $ips),
			]);

			return $handler($request, $options);
		};
	};
}

