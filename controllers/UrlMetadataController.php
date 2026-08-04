<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Exceptions\ValidationException;
use Framework\Responses\ResponseInterface;
use Respect\Validation\Validator;
use Utils\DOMParser;
use function Framework\success;
use function Utils\fetchPageHTML;
use function Utils\resolveUrl;

class UrlMetadataController implements ControllerInterface
{
	public function validateInput(): Validator
	{
		return Validator::key('url', Validator::url()->setName('URL'));
	}

	public function __invoke(array $input): ResponseInterface
	{
		$url = $input['url'];

		$html = fetchPageHTML($url);

		$parser = new DOMParser($html);
		$title = $parser->extractTitle();
		$description = $parser->extractDescription();
		$image_url = $parser->extractImage();
		if ($image_url) {
			$image_url = resolveUrl($image_url, $url);
		}

		if (!isset($title) && !isset($description) && !isset($image_url)) {
			throw new ValidationException('Failed to extract metadata');
		}

		return success(
			'Metadata fetched successfully',
			[
				'title' => $title ?? parse_url($url, PHP_URL_HOST),
				'description' => $description ?? '',
				'image' => $image_url ?? '',
				'url' => $url
			]
		);
	}
}
