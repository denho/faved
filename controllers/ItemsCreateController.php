<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Exceptions\DataWriteException;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Item;
use Models\ItemCreator;
use Models\Repository;
use Respect\Validation\Validator;
use function Framework\success;
use function Utils\processInputTags;

class ItemsCreateController implements ControllerInterface
{
	public function validateInput(): Validator
	{
		return Validator::key('title', Validator::stringType()->notEmpty())
			->key('url', Validator::url()->setName('URL'))
			->key('description', Validator::stringType()->setName('Description'))
			->key('comments', Validator::stringType()->setName('Notes'))
			->key('image', Validator::optional(Validator::url())->setName('Image URL'))
			->key('tags', Validator::arrayType()->setName('Tags'));
	}

	public function __invoke(array $input): ResponseInterface
	{
		$repository = ServiceContainer::get(Repository::class);

		// Handle tags (can throw an excepion)
		$tag_ids = processInputTags($input['tags']);

		// Save item in DB
		$item_creator = ServiceContainer::get(ItemCreator::class);
		[$item] = $item_creator->createItems([
			new Item(
				$input['url'],
				$input['title'],
				$input['description'],
				$input['image'] ?? '',
				$input['comments'] ?? '',
				$tag_ids
			)
		]);

		if (!$item || !$item->id) {
			throw new DataWriteException('Item creation failed');
		}

		return success('Item created successfully', [
			'item_id' => $item->id,
		]);
	}
}