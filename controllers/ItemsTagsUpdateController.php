<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Exceptions\DataWriteException;
use Framework\Exceptions\ValidationException;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use Respect\Validation\Validator;
use function Framework\success;

class ItemsTagsUpdateController implements ControllerInterface
{
	public function validateInput(): Validator
	{
		return Validator::key('item-ids', Validator::arrayType()->each(Validator::intType())->setName('Item IDs'))
			->key('tag-ids-all', Validator::arrayType()->each(Validator::intType())->setName('All Tags'))
			->key('tag-ids-some', Validator::arrayType()->each(Validator::intType())->setName('Some Tags'));
	}

	public function __invoke(array $input): ResponseInterface
	{

		$item_ids = $input['item-ids'];
		$tags_ids_all = $input['tag-ids-all'];
		$tags_ids_some = $input['tag-ids-some'];

		$repository = ServiceContainer::get(Repository::class);
		$tags = $repository->getTags();
		$exising_tag_ids = array_keys($tags);
		if (array_diff($tags_ids_all, $exising_tag_ids) || array_diff($tags_ids_some, $exising_tag_ids)) {
			return throw new ValidationException('Non-existing tags provided');
		}

		$result = $repository->deleteItemsTags($item_ids, $tags_ids_some);
		if (false === $result) {
			throw new DataWriteException('Failed to delete item tags');
		}

		$repository->attachItemsTags($item_ids, $tags_ids_all);
		
		// Refresh item Updated date
		$repository->refreshItemsUpdatedAt($item_ids);

		return success(
			'Tags updated successfully for ' . (count($item_ids) == 1 ? '1 item' : count($item_ids) . ' items')
		);
	}
}