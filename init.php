<?php

use Framework\Exceptions\DatabaseNotFound;
use Framework\ServiceContainer;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use Models\ItemCreator;
use Models\TagCreator;
use function Utils\ssrfGuardMiddleware;

// Bind DB services
ServiceContainer::bind(PDO::class, function () {
	$db_path = Config::getDBPath();
	if (!file_exists($db_path)) {
		throw new DatabaseNotFound();
	}

	if (!is_writable($db_path)) {
		throw new Exception("Database file not writable: {$db_path}");
	}

	$pdo = new PDO("sqlite:{$db_path}");
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	return $pdo;
});

ServiceContainer::bind(Models\Repository::class, function (): Models\Repository {
	$pdo = ServiceContainer::get(PDO::class);
	return new Models\Repository($pdo);
});

ServiceContainer::bind(TagCreator::class, function (): TagCreator {
	$pdo = ServiceContainer::get(PDO::class);
	return new TagCreator($pdo);
});

ServiceContainer::bind(ItemCreator::class, function (): ItemCreator {
	$pdo = ServiceContainer::get(PDO::class);
	return new ItemCreator($pdo);
});

// SSRF-safe outbound HTTP client: the guard validates every request and redirect
// hop, pins the connection to the resolved IP and forces TLS, so callers can
// fetch user-supplied URLs without reaching internal resources.
ServiceContainer::bind(Client::class, function (): Client {
	$stack = HandlerStack::create();
	$stack->after('allow_redirects', ssrfGuardMiddleware(), 'ssrf_guard');

	return new Client([
		'handler' => $stack,
		'verify' => true,
		'allow_redirects' => ['max' => 5, 'strict' => true, 'protocols' => ['http', 'https']],
		// Many sites serve degraded content to non-browser agents. Applied as a
		// default: Guzzle only adds it when the request sets no User-Agent.
		'headers' => [
			'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		],
	]);
});
