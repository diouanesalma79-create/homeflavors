<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->messages() as $messageData) {
            $sender = $this->findUserOrFail($messageData['sender_email']);
            $receiver = $this->findUserOrFail($messageData['receiver_email']);
            $content = "[seed-message:{$messageData['reference']}] {$messageData['content']}";

            Message::updateOrCreate(
                [
                    'sender_id' => $sender->id,
                    'receiver_id' => $receiver->id,
                    'content' => $content,
                ],
                [
                    'is_read' => $messageData['is_read'],
                ]
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function messages(): array
    {
        return [
            [
                'reference' => 'MSG-001',
                'sender_email' => 'visitor@homeflavors.com',
                'receiver_email' => 'gordon@homeflavors.com',
                'content' => 'Hi Gordon, is the Beef Wellington suitable for someone with a mushroom allergy?',
                'is_read' => true,
            ],
            [
                'reference' => 'MSG-002',
                'sender_email' => 'gordon@homeflavors.com',
                'receiver_email' => 'visitor@homeflavors.com',
                'content' => 'Absolutely not! The duxelles is central to the dish. I can prepare a specific sear for you instead.',
                'is_read' => true,
            ],
            [
                'reference' => 'MSG-003',
                'sender_email' => 'visitor@homeflavors.com',
                'receiver_email' => 'choumicha@homeflavors.com',
                'content' => 'Choumicha, what is the secret to getting the couscous so fluffy?',
                'is_read' => true,
            ],
            [
                'reference' => 'MSG-004',
                'sender_email' => 'choumicha@homeflavors.com',
                'receiver_email' => 'visitor@homeflavors.com',
                'content' => 'The secret is the three steamings and using a little bit of smen between each one.',
                'is_read' => false,
            ],
        ];
    }

    private function findUserOrFail(string $email): User
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            throw new RuntimeException("Unable to seed messages because user [{$email}] was not found.");
        }

        return $user;
    }
}
