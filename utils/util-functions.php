<?php

namespace Utils;

use Config;
use Exception;
use Framework\Exceptions\ValidationException;
use Framework\ServiceContainer;
use GuzzleHttp\Client;
use GuzzleHttp\Pool;
use GuzzleHttp\Psr7\Response;
use Models\Item;
use Models\ItemCreator;
use Models\Repository;
use Models\TagCreator;
use Psr\Http\Client\ClientExceptionInterface;

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
		'white ',
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
	// Initialize cURL
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
	curl_setopt($ch, CURLOPT_TIMEOUT, 30);
	curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

	$html = curl_exec($ch);

	if (curl_errno($ch)) {
		$error = curl_error($ch);
		curl_close($ch);
		throw new Exception("Failed to fetch URL: " . $error, 400);
	}

	$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);

	if ($http_code < 200 || $http_code >= 300) {
		throw new Exception("Page returned HTTP error: {$http_code}", 400);
	}

	if ($html === false) {
		throw new Exception("Failed to retrieve page content", 400);
	}

	return $html;
}


function createWelcomeContent()
{
	$tag_creator = ServiceContainer::get(TagCreator::class);
	$faved_tag_id = $tag_creator->createTag('Faved', 'This is a tag for Faved links. Feel free to delete it after getting familiar with those resources.', 0, 'gray', true);
	$welcome_tag_id = $tag_creator->createTag('Welcome', "Familiarize yourself with the functionality of Faved by exploring the articles under this tag.\n\nℹ️ This is a nested tag. Nested tags are perfect for grouping several projects, e.g. for Work, School, or Personal use. \n\n💡 To create a nested tag, simply separate words with a forward slash.", $faved_tag_id, 'green', false);

	$item_creator = ServiceContainer::get(ItemCreator::class);
	$item_creator->createItems([
		new Item(
			'https://faved.dev/',
			'Faved - Organize Your Bookmarks',
			'Free, open-source bookmark manager: superfast, lightweight, and secure. Organize with customisable nested tags, save web pages from any browser via a bookmarklet.',
			'https://faved.dev/static/images/og-image.png',
			'Faved main site',
			[$faved_tag_id],
		),
		new Item(
			'https://demo.faved.dev/',
			'Faved Demo',
			'Try out Faved online before installing it on your machine. Demo sites are provided for testing and are deleted after one month.',
			'',
			'',
			[$faved_tag_id]
		),
		new Item(
			'https://faved.dev/blog',
			'Blog | Faved - Organize Your Bookmarks',
			'Faved updates, tutorials and product announcements',
			'',
			'',
			[$faved_tag_id]
		),
		new Item(
			'https://github.com/denho/faved',
			'GitHub - denho/faved: Free open-source bookmark manager with customisable nested tags. Super fast and lightweight. All data is stored locally.',
			'Free open-source bookmark manager with customisable nested tags. Super fast and lightweight. All data is stored locally. - denho/faved',
			'https://repository-images.githubusercontent.com/995300772/895299f8-4360-4b17-a87e-4be5fb8f7e94',
			'',
			[$faved_tag_id]
		),
		new Item(
			'https://x.com/FavedTool',
			'Faved on Twitter / X (@FavedTool)',
			'Lightning fast free open source bookmark manager with accent on privacy and data ownership.',
			'',
			'',
			[$faved_tag_id]
		),
		new Item(
			'https://faved.dev/blog/meet-faved-open-source-privacy-first-bookmark-manager',
			'Meet Faved: An Open-Source Privacy-First Bookmark Manager | Faved - Organize Your Bookmarks',
			'In a world where every digital service wants to control your data, I believe it’s important to have an option to keep your data secure from trackers and advertising networks. That’s why I built Faved: an open-source, self-hosted bookmark manager that gives you complete control over your saved web content and links.',
			'',
			'',
			[$welcome_tag_id]
		),
		new Item (
			'https://faved.dev/blog/migrate-pocket-to-faved',
			'How to Migrate Your Data from Pocket to Faved | Faved - Organize Your Bookmarks',
			'Pocket is shutting down on July 8, 2025. As a privacy-first alternative, Faved lets you organize and manage your bookmarks while keeping full ownership of your data. Learn how to migrate your data from Pocket to Faved in a few simple steps.',
			'https://faved.dev/static/images/posts/migrate-pocket-to-faved/migrate-from-pocket-to-faved-ogimage.png',
			'',
			[$welcome_tag_id]
		)
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

function getItemImageLocalPath($image_url, $item_id): string
{
	$extension = pathinfo(parse_url($image_url, PHP_URL_PATH), PATHINFO_EXTENSION);
	$extension = strtolower($extension);
	$image_name = md5($image_url) . ($extension ? '.' . $extension : '');
	return sprintf('%s/%s', getItemImageLocalDir($item_id), $image_name);
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

	$client = new Client([
		'timeout' => 10,
		'connect_timeout' => 5,
	]);

	// Create requests generator
	$requests = function () use ($unique_urls, $client) {
		foreach ($unique_urls as $url) {
			yield function () use ($client, $url) {
				return $client->getAsync($url);
			};
		}
	};

	$pages = [];
	$failed_reasons = [];

	// Execute parallel requests
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
		'rejected' => function (ClientExceptionInterface $reason, $index) use (&$failed_reasons, $unique_urls) {
			$url = $unique_urls[$index];
			$failed_reasons[$url] = $reason->getMessage();
		},
	]);

	// Wait for all requests to complete
	$promise = $pool->promise();
	$promise->wait();

	return [$pages, $failed_reasons];
}

function getLocalFileContents($path)
{
	if (!file_exists($path)) {
		return null;
	}
	$contents = file_get_contents($path);
	if ($contents === false) {
		throw new \RuntimeException('Failed to read file');
	}
	return $contents;
}

function getRemoteImageContents($url)
{
	$client = new Client();
	$response = $client->get($url, [
		'stream' => true,
		'headers' => [
			'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		],
		'timeout' => 5,
	]);

	$content_type = $response->getHeaderLine('content-type');
	$allowed_types = [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/svg+xml',
		'image/bmp',
		'image/tiff',
	];
	if (!in_array($content_type, $allowed_types)) {
		throw new ValidationException('Unsupported image type: ' . $content_type);
	}

	$body = $response->getBody();
	$contents = $body->getContents();

	return $contents;
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

function createDemoContent($repository)
{
	$raw_sql = file_get_contents(ROOT_DIR . '/sql-dumps/tags.sql');
	$repository->runRawSQL($raw_sql);
	$raw_sql = file_get_contents(ROOT_DIR . '/sql-dumps/items.sql');
	$repository->runRawSQL($raw_sql);
	$raw_sql = file_get_contents(ROOT_DIR . '/sql-dumps/items_tags.sql');
	$repository->runRawSQL($raw_sql);
}