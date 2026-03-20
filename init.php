<?php

use Framework\Exceptions\DatabaseNotFound;
use Framework\ServiceContainer;
use Models\ItemCreator;
use Models\TagCreator;

// Bind DB services
ServiceContainer::bind(PDO::class, function () {
	$db_path = Config::getDBPath();
	if (!file_exists($db_path)) {
		throw new DatabaseNotFound();
	}

	if (!is_writable($db_path)) {
		throw new Exception("Database file not writable: {$db_path}");
	}

	$pdo = new PDO("sqlite:{$db_path}");
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	return $pdo;
});

ServiceContainer::bind(Models\Repository::class, function (): Models\Repository {
	$pdo = ServiceContainer::get(PDO::class);
	return new Models\Repository($pdo);
});

ServiceContainer::bind(TagCreator::class, function (): TagCreator {
	$pdo = ServiceContainer::get(PDO::class);
	return new TagCreator($pdo);
});

ServiceContainer::bind(ItemCreator::class, function (): ItemCreator {
	$pdo = ServiceContainer::get(PDO::class);
	return new ItemCreator($pdo);
});