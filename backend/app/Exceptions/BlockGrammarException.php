<?php

namespace App\Exceptions;

use RuntimeException;

class BlockGrammarException extends RuntimeException
{
    private array $validationErrors;

    public function __construct(array $errors, string $context = '')
    {
        $this->validationErrors = $errors;
        $message = 'Block grammar validation failed';
        if ($context !== '') {
            $message .= " ({$context})";
        }
        $message .= ': ' . implode('; ', $errors);
        parent::__construct($message);
    }

    public function getValidationErrors(): array
    {
        return $this->validationErrors;
    }
}
