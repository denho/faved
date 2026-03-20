<?php

use Controllers\AppInfoController;
use Controllers\AuthLoginController;
use Controllers\AuthLogoutController;
use Controllers\ImportBookmarksController;
use Controllers\ImportPocketController;
use Controllers\ItemsCreateController;
use Controllers\ItemsDeleteController;
use Controllers\ItemsFetchMetadataController;
use Controllers\ItemsGetController;
use Controllers\ItemsTagsUpdateController;
use Controllers\ItemsUpdateController;
use Controllers\SetupDatabaseController;
use Controllers\TagsController;
use Controllers\TagsCreateController;
use Controllers\TagsDeleteController;
use Controllers\TagsUpdateColorController;
use Controllers\TagsUpdateController;
use Controllers\TagsUpdatePinnedController;
use Controllers\UrlMetadataController;
use Controllers\UserCreateController;
use Controllers\UserDeleteController;
use Controllers\UserGetController;
use Controllers\UserPasswordUpdateController;
use Controllers\UserUsernameUpdateController;

return [
	'api' => [
		'items' => [
			'/' => [
				'GET' => ItemsGetController::class,
				'POST' => ItemsCreateController::class,
				'PATCH' => ItemsUpdateController::class,
			],
			'delete' => [
				'POST' => ItemsDeleteController::class,
			],
			'fetch-metadata' => [
				'POST' => ItemsFetchMetadataController::class,
			],
			'tags' => [
				'PATCH' => ItemsTagsUpdateController::class,
			],
		],
		'tags' => [
			'/' => [
				'GET' => TagsController::class,
				'POST' => TagsCreateController::class,
				'DELETE' => TagsDeleteController::class,
			],
			'update' => [
				'PATCH' => TagsUpdateController::class,
			],
			'update-pinned' => [
				'PATCH' => TagsUpdatePinnedController::class,
			],
			'update-color' => [
				'PATCH' => TagsUpdateColorController::class,
			],
		],
		'settings' => [
			'user' => [
				'GET' => UserGetController::class,
				'POST' => UserCreateController::class,
				'DELETE' => UserDeleteController::class,
			],
			'username' => [
				'PATCH' => UserUsernameUpdateController::class,
			],
			'password' => [
				'PATCH' => UserPasswordUpdateController::class,
			],
		],
		'auth' => [
			'login' => [
				'POST' => AuthLoginController::class,
			],
			'logout' => [
				'POST' => AuthLogoutController::class
			],
		],
		'setup' => [
			'database' => [
				'POST' => SetupDatabaseController::class
			],
		],
		'import' => [
			'pocket' => [
				'POST' => ImportPocketController::class,
			],
			'bookmarks' => [
				'POST' => ImportBookmarksController::class,
			],
		],
		'url' => [
			'fetch-metadata' => [
				'POST' => UrlMetadataController::class,
			],
		],
		'app-info' => [
			'GET' => AppInfoController::class,
		],
	],
	'content' => [
		'fetch-image' => [
			'GET' => Controllers\ImageFetchController::class,
		]
	]
];
