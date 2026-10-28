<?php

namespace Framework\Responses;

class DataResponse implements ResponseInterface
{
	public function __construct(protected array $data, protected int $code)
	{
	}

	public function yield(): void {
		http_response_code($this->code);

		// Set headers for JSON response
		header('Content-Type: application/json; charset=utf-8');
		header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1
		header('Pragma: no-cache'); // HTTP 1.0
		header('Expires: 0'); // Proxies
		header('Access-Control-Allow-Origin: *'); // Allow all origins for CORS

		header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
		header('Access-Control-Allow-Headers: Content-Type, Authorization');
		header('Access-Control-Max-Age: 86400');

		// Output the JSON data
		$json = json_encode($this->data, JSON_INVALID_UTF8_SUBSTITUTE | JSON_UNESCAPED_UNICODE);
		if ($json === false) {
			http_response_code(500);
			$json = json_encode(['error' => json_last_error_msg()]);
		}
		echo $json;
	}
}