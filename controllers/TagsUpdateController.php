<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use Respect\Validation\Validator;
use function Framework\success;
use function Utils\processInputTags;

class TagsUpdateController implements ControllerInterface
{
	public function validateInput()
	{
		return Validator::key('tag-id', Validator::stringType()->notEmpty())
			->key('parent', Validator::anyOf(Validator::stringType(), Validator::intType())->setName('Parent Tag ID'))
			->key('title', Validator::stringType()->notEmpty()->length(1, 255))
			->key('description', Validator::stringType()->length(null, 1000));
	}

	public function __invoke(array $input): ResponseInterface
	{
		$tag_id = (int)$input['tag-id'];

		if ((int)$input['parent'] === 0) {
			$parent_id = 0;
		} else {
			[$parent_id] = processInputTags([$input['parent']]);
		}

		$tag_title = trim($input['title']);
		$tag_description = trim($input['description']);

		$repository = ServiceContainer::get(Repository::class);
		$all_tags = $repository->getTags();

		if (!isset($all_tags[$tag_id])) {
			throw new \Exception('Tag does not exist');
		}

		$current_parent_id = $parent_id;
		$visited_parent_ids = [];
		while ($current_parent_id !== 0) {
			if ($current_parent_id === $tag_id) {
				throw new \Exception('Tag cannot be its own parent or child');
			}

			if (isset($visited_parent_ids[$current_parent_id]) || !isset($all_tags[$current_parent_id])) {
				throw new \Exception('Invalid tag parent');
			}

			$visited_parent_ids[$current_parent_id] = true;
			$current_parent_id = (int)$all_tags[$current_parent_id]['parent'];
		}

		$repository->updateTag(
			$tag_id,
			$tag_title,
			$tag_description,
			$parent_id
		);

		return success(
			'Tag updated successfully',
			[
				'tag_id' => $tag_id,
				'parent_id' => $parent_id,
				'title' => $input['title'],
				'description' => $input['description'],
			]
		);
	}

}
