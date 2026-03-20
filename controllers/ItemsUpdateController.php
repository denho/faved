<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Exceptions\DataWriteException;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use Respect\Validation\Validator;
use function Framework\success;
use function Utils\clearItemImageDirectory;
use function Utils\processInputTags;

class ItemsUpdateController implements ControllerInterface
{
	public function validateInput(): Validator
	{
		return Validator::key('item-id', Validator::stringType()->notEmpty())
			->key('title', Validator::stringType()->notEmpty())
			->key('url', Validator::url()->setName('URL'))
			->key('description', Validator::stringType()->setName('Description'))
			->key('comments', Validator::stringType()->setName('Notes'))
			->key('image', Validator::optional(Validator::url())->setName('Image URL'))
			->key('tags', Validator::arrayType()->setName('Tags'))
			->key('force-image-refetch', Validator::boolType(), false);
	}

	public function __invoke(array $input): ResponseInterface
	{
		// Handle tags (can throw an excepion)
		$tag_ids = processInputTags($input['tags']);

		// Save item in DB
		$item_id = $_GET['item-id'];
		$image = $input['image'];

		$repository = ServiceContainer::get(Repository::class);

		$result = $repository->updateItem($input['title'], $input['description'], $input['url'], $input['comments'], $image, $item_id);
		if (!$result) {
			throw new DataWriteException('Item update failed');
		}

		$result = $repository->setItemTags($tag_ids, $item_id);

		if (!$result) {
			throw new DataWriteException('Item tags update failed');
		}

		// Clear local image if needed
		if (empty($image) || !empty($input['force-image-refetch'])) {
			clearItemImageDirectory($item_id);
		}

		return success('Item updated successfully', [
			'item_id' => $item_id,
		]);
	}
}