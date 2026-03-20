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

		if ($input['parent'] === 0) {
			$parent_id = 0;
		} else {
			[$parent_id] = processInputTags([$input['parent']]);
		}

		if ($tag_id === $parent_id) {
			throw new \Exception('Tag cannot be the same as parent');
		}

		$tag_title = trim($input['title']);
		$tag_description = trim($input['description']);

		$repository = ServiceContainer::get(Repository::class);
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