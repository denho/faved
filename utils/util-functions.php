<?php

namespace Utils;

use Config;
use Exception;
use Framework\Exceptions\ValidationException;
use Framework\ServiceContainer;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Pool;
use GuzzleHttp\Psr7\Response;
use Models\Item;
use Models\ItemCreator;
use Models\Repository;
use Models\TagCreator;
use Psr\Http\Message\ResponseInterface;

function groupTagsByParent($tags)
{
	$tags_by_parent = [];
	foreach ($tags as $tag_id => $tag) {
		$tags_by_parent[$tag['parent']][] = $tag_id;
	}
	return $tags_by_parent;
}


function getTagColors()
{
	return [
		'gray',
		'green',
		'red',
		'yellow',
		'aqua',
		'white',
		'black',
	];
}

function extractTagSegments(string $title): array
{
	// Explode by forward slash, preserving escaped slashes
	$title = str_replace('\/', '__SLASH__', $title);
	$segments = explode('/', $title);
	$segments = array_map(fn($segment) => str_replace('__SLASH__', '/', $segment), $segments);
	// Remove empty segments
	$segments = array_map('trim', $segments);
	$segments = array_filter($segments, fn($segment) => '' !== $segment);
	return $segments;
}

function createTagsFromSegments(array $tag_segments, $tag_description = ''): int
{
	$repository = ServiceContainer::get(Repository::class);
	$tags = $repository->getTags();
	$tag_creator = ServiceContainer::get(TagCreator::class);

	$parent_tag_id = 0;
	$check_existing_parent = true;
	foreach ($tag_segments as $tag_title) {
		$existing_parent = array_find($tags, function ($tag) use ($tag_title, $parent_tag_id) {
			return strtolower($tag['title']) === strtolower($tag_title) && $tag['parent'] === $parent_tag_id;
		});

		if ($check_existing_parent && $existing_parent) {
			$parent_tag_id = $existing_parent['id'];
			continue;
		}

		$parent_tag_id = $tag_creator->createTag($tag_title, $tag_description, $parent_tag_id);
		$check_existing_parent = false;
	}

	return (int)$parent_tag_id;
}

function processInputTags($input_tags): array
{
	$repository = ServiceContainer::get(Repository::class);// Handle tags

	$new_tag_paths = array_filter($input_tags, fn($tag) => is_string($tag) && str_starts_with($tag, 'create:'));
	$input_existing_tag_ids = array_map('intval', array_diff($input_tags, $new_tag_paths));

	$tags = $repository->getTags();
	$exising_tag_ids = array_keys($tags);
	if (array_diff($input_existing_tag_ids, $exising_tag_ids)) {
		throw new ValidationException('Non-existing tags provided');
	}

	$input_created_tag_ids = array_map(function ($tag) {
		$tag_path = substr($tag, strlen('create:'));
		$tag_segments = extractTagSegments($tag_path);
		$tag_id = createTagsFromSegments($tag_segments);
		return $tag_id;
	}, $new_tag_paths);
	return [
		...$input_existing_tag_ids,
		...$input_created_tag_ids,
	];
}

/*
 * Resolve relative URL to absolute URL
 */
function resolveUrl(string $relative_url, string $base_url): string
{
	// If it's already an absolute URL, return as is
	if (filter_var($relative_url, FILTER_VALIDATE_URL)) {
		return $relative_url;
	}

	// Parse base URL
	$baseParts = parse_url($base_url);
	$scheme = $baseParts['scheme'] ?? 'https';
	$host = $baseParts['host'] ?? '';

	// Handle protocol-relative URLs
	if (str_starts_with($relative_url, '//')) {
		return $scheme . ':' . $relative_url;
	}

	// Handle absolute paths
	if (str_starts_with($relative_url, '/')) {
		return $scheme . '://' . $host . $relative_url;
	}

	// Handle relative paths
	$path = $baseParts['path'] ?? '/';
	$path = rtrim(dirname($path), '/');

	return $scheme . '://' . $host . $path . '/' . $relative_url;
}

function fetchPageHTML(string $url): string
{
	// SSRF checks, IP pinning and TLS are enforced by the client's guard middleware.
	$client = ServiceContainer::get(Client::class);

	try {
		$response = $client->get($url, [
			'timeout' => 30,
			'connect_timeout' => 10,
			// Non-2xx is handled below, not raised as a Guzzle exception.
			'http_errors' => false,
		]);
	} catch (GuzzleException $e) {
		// Transport failures only; SSRF rejections are ValidationExceptions
		// and deliberately pass through uncaught.
		throw new Exception('Failed to fetch URL: ' . $e->getMessage(), 400);
	}

	$status = $response->getStatusCode();
	if ($status < 200 || $status >= 300) {
		throw new Exception("Page returned HTTP error: {$status}", 400);
	}

	$body = (string)$response->getBody();
	if ($body === '') {
		throw new Exception("Failed to retrieve page content", 400);
	}

	return $body;
}


function createWelcomeContent()
{
	$tag_creator = ServiceContainer::get(TagCreator::class);
	$faved_tag_id = $tag_creator->createTag('Faved', 'This is a tag for Faved links. Feel free to delete it after getting familiar with those resources.', 0, 'aqua', true);
	$docs_tag_id = $tag_creator->createTag('Docs', "Familiarize yourself with the functionality of Faved by exploring the articles under this tag.\n\nℹ️ This is a nested tag. Nested tags are perfect for grouping several projects, e.g. for Work, School, or Personal use. \n\n💡 To create a nested tag, simply separate words with a forward slash.", $faved_tag_id, 'gray', false);
	$docs_getting_started_tag_id = $tag_creator->createTag('Getting started', '', $docs_tag_id, 'yellow', false);
	$docs_guides_tag_id = $tag_creator->createTag('Guides', '', $docs_tag_id, 'red', false);
	$quick_links_tag_id = $tag_creator->createTag('Quick links', '', $faved_tag_id, 'green', false);


	$item_creator = ServiceContainer::get(ItemCreator::class);
	$item_creator->createItems([
		new Item(
			'https://faved.to/',
			'Faved - Organize Your Bookmarks',
			'Free, open-source bookmark manager: superfast, lightweight, and secure. Organize with customisable nested tags, save web pages from any browser via a bookmarklet.',
			'https://faved.to/static/images/og-image.png',
			'Faved main site',
			[$quick_links_tag_id],
		),
		new Item(
			'https://demo.faved.to/',
			'Faved Demo',
			'Try out Faved online before installing it on your machine. Demo sites are provided for testing and are deleted after one month.',
			'',
			'',
			[$quick_links_tag_id]
		),
		new Item(
			'https://faved.to/blog',
			'Blog | Faved - Organize Your Bookmarks',
			'Faved updates, tutorials and product announcements',
			'',
			'',
			[$quick_links_tag_id]
		),
		new Item(
			'https://github.com/denho/faved',
			'GitHub - denho/faved: Free open-source bookmark manager with customisable nested tags. Super fast and lightweight. All data is stored locally.',
			'Free open-source bookmark manager with customisable nested tags. Super fast and lightweight. All data is stored locally. - denho/faved',
			'https://repository-images.githubusercontent.com/995300772/895299f8-4360-4b17-a87e-4be5fb8f7e94',
			'',
			[$quick_links_tag_id]
		),
		new Item(
			'https://x.com/FavedTool',
			'Faved on Twitter / X (@FavedTool)',
			'Lightning fast free open source bookmark manager with accent on privacy and data ownership.',
			'',
			'',
			[$quick_links_tag_id]
		),
		new Item('https://faved.to/docs/guides/bulk-actions',
			'Bulk actions',
			'Perform operations on multiple bookmarks simultaneously.',
			'https://faved.to/static/og/docs__guides__bulk-actions.png',
			'',
			[$docs_guides_tag_id]),
		new Item('https://faved.to/docs/guides/finding-and-viewing-bookmarks',
			'Finding and viewing bookmarks',
			'Search, filter, and display your saved bookmarks the way that works best for you.',
			'https://faved.to/static/og/docs__guides__finding-and-viewing-bookmarks.png',
			'',
			[$docs_guides_tag_id]),
		new Item('https://faved.to/docs/guides/organizing-with-tags',
			'Organizing with tags',
			'How Faved\'s tag system works and how to make the most of it.',
			'https://faved.to/static/og/docs__guides__organizing-with-tags.png',
			'',
			[$docs_guides_tag_id]),
		new Item('https://faved.to/docs/guides/importing-bookmarks',
			'Importing bookmarks',
			'Move your existing bookmarks into Faved from other tools.',
			'https://faved.to/static/og/docs__guides__importing-bookmarks.png',
			'',
			[$docs_guides_tag_id]),
		new Item('https://faved.to/docs/guides/adding-and-editing-bookmarks',
			'Adding and editing bookmarks',
			'How to save links and keep their details accurate over time.',
			'https://faved.to/static/og/docs__guides__adding-and-editing-bookmarks.png',
			'',
			[$docs_guides_tag_id]),
		new Item('https://faved.to/docs/getting-started/saving-with-apple-shortcut',
			'Saving with Apple shortcut',
			'Save links to Faved from the Share Sheet on iOS, iPadOS, and macOS — and the Services menu on Mac.',
			'https://faved.to/static/og/docs__getting-started__saving-with-apple-shortcut.png',
			'',
			[$docs_getting_started_tag_id]),
		new Item('https://faved.to/docs/getting-started/using-browser-bookmarklet',
			'Using browser bookmarklet',
			'Save any web page to your collection in one click, from any browser.',
			'https://faved.to/static/og/docs__getting-started__using-browser-bookmarklet.png',
			'',
			[$docs_getting_started_tag_id]),
		new Item('https://faved.to/docs/getting-started/installing-as-a-pwa-app',
			'Installing as a PWA app',
			'Install Faved on any device for a faster, native app-like experience.',
			'https://faved.to/static/og/docs__getting-started__installing-as-a-pwa-app.png',
			'',
			[$docs_getting_started_tag_id]),
	]);
}

function buildPublicUserObject(array $user): array
{
	return [
		...array_intersect_key(
			$user,
			array_flip(['id', 'username', 'created_at', 'updated_at'])
		),
	];
}

/**
 * Where an item image is stored. The extension comes from the verified media
 * type, never from the URL, so a remote host cannot choose it.
 */
function buildItemImageLocalPath($image_url, $item_id, string $extension): string
{
	return sprintf('%s/%s.%s', getItemImageLocalDir($item_id), md5($image_url), $extension);
}

/**
 * Locate a cached item image whatever extension it was stored under, or null.
 */
function getItemImageLocalFile($image_url, $item_id): ?string
{
	$pattern = sprintf('%s/%s.*', getItemImageLocalDir($item_id), md5($image_url));
	foreach (glob($pattern) ?: [] as $match) {
		if (is_file($match)) {
			$contents = file_get_contents($match);
			if ($contents !== false) {
				return $contents;
			}
		}
	}
	return null;
}

function getItemImageLocalDir($item_id): string
{
	return sprintf('%s/%s', Config::getImageStoragePath(), $item_id);
}

function getInstalledAppInfo(): ?array
{
	$info_file_path = ROOT_DIR . '/app-info.json';
	$data = file_exists($info_file_path) ? file_get_contents($info_file_path) : '';
	$data = json_decode($data, true);
	return $data;
}

function getAppUpdateInfo(): ?array
{
	try {
		// Check cache first
		$cache_file_path = sys_get_temp_dir() . '/app-update-info-cache.json';
		$cache_period = 60 * 60 * 12; // 12 hours
		$data = file_exists($cache_file_path) ? file_get_contents($cache_file_path) : '';
		$data = json_decode($data, true);
		$is_cache_expired = ($data['cache_timestamp'] ?? 0) + $cache_period < time();
		if (!$is_cache_expired) {
			return $data;
		}

		// Fetch new data
		$data = fetchAppUpdateInfo();
		if (!$data) {
			return null;
		}

		// Store in cache
		$data['cache_timestamp'] = time();
		file_put_contents($cache_file_path, json_encode($data), LOCK_EX);

		return $data;
	} catch (Exception $e) {
		return null;
	}
}

function fetchAppUpdateInfo(): ?array
{
	$client = new Client();
	$url = 'https://api.faved.dev/v1/app/update-info';

	$app_info = getInstalledAppInfo();
	$installed_version = $app_info['version'] ?? 'unknown';

	$response = $client->get($url, [
		'headers' => [
			'Accept' => 'application/json',
			'User-Agent' => "Faved/{$installed_version} (VersionCheck)",
		],
		'timeout' => 15,
	]);

	if ($response->getStatusCode() !== 200) {
		return null;
	}

	return json_decode($response->getBody(), true);
}

function fetchMultiplePageHTML(array $urls): array
{
	$unique_urls = array_values(array_unique($urls));

	// SSRF checks, IP pinning and TLS are enforced by the client's guard middleware.
	$client = ServiceContainer::get(Client::class);

	$pages = [];
	$failed_reasons = [];

	$request_options = [
		'timeout' => 10,
		'connect_timeout' => 5,
		// Non-2xx is handled in the fulfilled callback below.
		'http_errors' => false,
	];

	// Every URL enters the pool; the guard rejects internal ones as they dispatch.
	$requests = function () use ($unique_urls, $client, $request_options) {
		foreach ($unique_urls as $url) {
			yield function () use ($client, $url, $request_options) {
				return $client->getAsync($url, $request_options);
			};
		}
	};

	$pool = new Pool($client, $requests(), [
		'concurrency' => 10,
		'fulfilled' => function (Response $response, $index) use (&$pages, &$failed_reasons, $unique_urls) {
			$url = $unique_urls[$index];

			$http_code = $response->getStatusCode();
			if ($http_code < 200 || $http_code >= 300) {
				$failed_reasons[$url] = "HTTP error code: $http_code";
				return;
			}

			$body = (string)$response->getBody();
			if ($body === '') {
				$failed_reasons[$url] = 'Page content is empty';
				return;
			}

			$pages[$url] = $body;
		},
		// Reason may be a Guzzle exception or the guard's ValidationException.
		'rejected' => function ($reason, $index) use (&$failed_reasons, $unique_urls) {
			$url = $unique_urls[$index];
			$failed_reasons[$url] = $reason instanceof \Throwable ? $reason->getMessage() : 'Request failed';
		},
	]);

	$promise = $pool->promise();
	$promise->wait();

	return [$pages, $failed_reasons];
}
/**
 * Media types we accept, mapped to the extension we store them as. Keyed by what
 * finfo reports for the actual bytes, so the alternative labels servers send
 * (image/jpg, image/pjpeg, image/x-png) need no entry - those bytes normalise to
 * these types. SVG is absent deliberately: it can carry script and would be a
 * stored XSS vector when served back inline.
 */
const IMAGE_TYPES = [
	'image/jpeg' => 'jpg',
	'image/png' => 'png',
	'image/gif' => 'gif',
	'image/webp' => 'webp',
	'image/bmp' => 'bmp',
	'image/tiff' => 'tiff',
	'image/avif' => 'avif',
];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * Fetch a remote image and verify it is one of IMAGE_TYPES.
 *
 * @return array{contents: string, mime: string, extension: string}
 * @throws ValidationException when the response is not an acceptable image
 */
function fetchRemoteImage(string $url): array
{
	// SSRF checks, IP pinning and TLS are enforced by the client's guard middleware.
	$client = ServiceContainer::get(Client::class);

	// Not streamed: Guzzle would route this to StreamHandler, which ignores
	// $options['curl'] and would silently drop the guard's CURLOPT_RESOLVE pin.
	try {
		$response = $client->get($url, [
			'timeout' => 5,
			'curl' => [CURLOPT_MAXFILESIZE => MAX_IMAGE_BYTES],
			// Reject before the body is downloaded where the headers already tell
			// us enough. Both checks are advisory - the bytes decide below.
			'on_headers' => function ($response): void {
				// Handlers decide what they pass here; Guzzle's MockHandler hands
				// over the queued throwable. Nothing to inspect then - the
				// transport error surfaces on its own.
				if (!$response instanceof ResponseInterface) {
					return;
				}
				if ((int)$response->getHeaderLine('Content-Length') > MAX_IMAGE_BYTES) {
					throw new ValidationException('Image is too large');
				}
				$declared = strtolower(trim(explode(';', $response->getHeaderLine('Content-Type'))[0]));
				if ($declared !== '' && !str_starts_with($declared, 'image/')) {
					throw new ValidationException('Not an image: ' . $declared);
				}
			},
		]);
	} catch (GuzzleException $e) {
		// Guzzle wraps whatever on_headers throws, which would hide our reason
		// behind a generic transport error. Surface the original.
		if ($e->getPrevious() instanceof ValidationException) {
			throw $e->getPrevious();
		}
		throw $e;
	}

	$contents = (string)$response->getBody();
	if (strlen($contents) > MAX_IMAGE_BYTES) {
		throw new ValidationException('Image is too large');
	}

	// The bytes decide. Content-Type is chosen by the remote host, so it only
	// ever short-circuits above - it never grants acceptance.
	$mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($contents);
	if (!is_string($mime) || !isset(IMAGE_TYPES[$mime])) {
		throw new ValidationException('Unsupported image type: ' . ($mime ?: 'unknown'));
	}

	return ['contents' => $contents, 'mime' => $mime, 'extension' => IMAGE_TYPES[$mime]];
}

function saveImageToLocalPath($local_path, $image_contents): void
{
	$directory_path = dirname($local_path);
	if (!is_dir($directory_path)) {
		makeDirectory($directory_path);
	} else {
		clearDirectory($directory_path);
	}
	$result = file_put_contents($local_path, $image_contents);
	if ($result === false) {
		throw new \RuntimeException('Failed to write file');
	}
}

function makeDirectory($directory_path)
{
	if (!mkdir($directory_path, 0755, true) && !is_dir($directory_path)) {
		throw new \RuntimeException(sprintf('Directory "%s" was not created', $directory_path));
	}
}

function clearItemImageDirectory($item_id)
{
	$directory_path = getItemImageLocalDir($item_id);
	if (!is_dir($directory_path)) {
		return;
	}
	clearDirectory($directory_path);
}

function clearDirectory($directory_path)
{
	$files = glob($directory_path . '/*');
	foreach ($files as $file) {
		if (is_file($file)) {
			unlink($file);
		}
	}
}

function removeItemImageDirectory($item_id)
{
	$directory_path = getItemImageLocalDir($item_id);

	clearDirectory($directory_path);

	if (is_dir($directory_path)) {
		rmdir($directory_path);
	}
}