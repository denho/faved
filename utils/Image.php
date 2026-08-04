<?php

namespace Utils;

/**
 * Image domain rules shared by the fetch (fetchRemoteImage) and serve
 * (MediaResponse) paths. Class constants autoload, giving one source of truth.
 */
final class Image
{
	/**
	 * Accepted media type => stored extension. Keyed on what finfo sniffs, so
	 * server aliases (image/jpg, image/x-png) need no entry. SVG excluded: it can
	 * carry script - a stored-XSS vector when served back inline.
	 */
	public const TYPES = [
		'image/jpeg' => 'jpg',
		'image/png' => 'png',
		'image/gif' => 'gif',
		'image/webp' => 'webp',
		'image/bmp' => 'bmp',
		'image/tiff' => 'tiff',
		'image/avif' => 'avif',
	];

	public const MAX_BYTES = 10 * 1024 * 1024;

	/** Whether finfo's sniffed media type is one we accept. */
	public static function isAllowed(string $mime): bool
	{
		return isset(self::TYPES[$mime]);
	}

	/** Canonical storage extension for an accepted media type. */
	public static function extensionFor(string $mime): string
	{
		return self::TYPES[$mime] ?? 'img';
	}
}
