<?php

namespace Controllers;

use Framework\ControllerInterface;
use Framework\Exceptions\ValidationException;
use Framework\Responses\ResponseInterface;
use Framework\ServiceContainer;
use Models\Repository;
use function Framework\success;

class TagsUpdatePinnedController implements ControllerInterface
{
	public function __invoke(array $input): ResponseInterface
	{
		if (!isset($input['tag-id'], $input['pinned']) || !is_bool($input['pinned'])) {
			throw new ValidationException('Invalid input data for tag pinned update.');
		}

		$tag_id = (int)$input['tag-id'];

		$repository = ServiceContainer::get(Repository::class);
		$tags = $repository->getTags();
		$tag = $tags[$tag_id] ?? null;

		if (null === $tag) {
			throw new ValidationException("Tag with ID $tag_id does not exist.");
		}

		if ((bool)$tag['pinned'] === $input['pinned']) {
			return success(
				'Tag pinned state is already set to the requested value.',
				[
					'tag_id' => $tag_id,
					'pinned' => $input['pinned'],
				]
			);
		}

		$repository->updateTagPinned(
			$tag_id,
			$input['pinned']
		);

		return success(
			'Tag pinned state updated successfully.',
			[
				'tag_id' => $tag_id,
				'pinned' => $input['pinned'],
			]
		);
	}
}