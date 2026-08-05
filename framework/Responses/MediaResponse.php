<?php

namespace Framework\Responses;

class MediaResponse implements ResponseInterface
{
	public function __construct(protected string $contents, protected int $cache_minutes)
	{
	}

	public function yield(): void
	{
		$contents = $this->contents;

		$finfo = new \finfo(FILEINFO_MIME_TYPE);
		$mime = $finfo->buffer($contents);

		// Anti-sniffing XSS guard: recognised images keep their type, anything else
		// downloads as octet-stream. Pairs with the nosniff header below.
		if (!is_string($mime) || !\Utils\Image::isAllowed($mime)) {
			$mime = 'application/octet-stream';
		}

		http_response_code(200);
		header("Content-Type: {$mime}");
		header('X-Content-Type-Options: nosniff');
		header("Content-Length: " . strlen($contents));

		// Set caching headers
		if ($this->cache_minutes > 0) {
			$cache_seconds = $this->cache_minutes * 60;
			header("Cache-Control: public, max-age={$cache_seconds}, immutable");
		} else {
			header("Cache-Control: no-cache, no-store, must-revalidate");
		}
		// Remove headers that might interfere with caching set with Cache-Control
		header_remove('Pragma');
		header_remove('Expires');

		echo $contents;
	}
}