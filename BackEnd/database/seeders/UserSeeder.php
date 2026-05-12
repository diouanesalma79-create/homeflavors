<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->users() as $userData) {
            $userData['password'] = Hash::make($userData['password']);
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            if (blank($user->email_verified_at)) {
                $user->forceFill([
                    'email_verified_at' => now(),
                ])->save();
            }
        }
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function users(): array
    {
        return [
            [
                'name' => 'Admin User',
                'email' => 'admin@homeflavors.com',
                'password' => 'password',
                'role' => 'admin',
                'status' => 'active',
                'phone' => '+1 555 100 0001',
                'address' => '1 HomeFlavors Admin Plaza',
            ],
            [
                'name' => 'Gordon Ramsay',
                'email' => 'gordon@homeflavors.com',
                'password' => 'password',
                'role' => 'cook',
                'status' => 'active',
                'phone' => '+44 20 7352 4441',
                'address' => 'London, United Kingdom',
                'nationality' => 'British',
                'bio' => 'World-renowned multi-Michelin starred chef and television personality, known for high standards and authentic British-French fusion.',
                'chef_image' => 'Gordon_Ramsay.jpg',
            ],
            [
                'name' => 'CHOUMICHA',
                'email' => 'choumicha@homeflavors.com',
                'password' => 'password',
                'role' => 'cook',
                'status' => 'active',
                'phone' => '+212 522 100 200',
                'address' => 'Casablanca, Morocco',
                'nationality' => 'Moroccan',
                'bio' => 'The icon of Moroccan cuisine, Choumicha has inspired generations with her deep knowledge of traditional spices and heritage recipes.',
                'chef_image' => 'CHOUMICHA.jpg',
            ],
            [
                'name' => 'Alain Ducasse',
                'email' => 'alain@homeflavors.com',
                'password' => 'password',
                'role' => 'cook',
                'status' => 'active',
                'phone' => '+33 1 44 11 00 00',
                'address' => 'Paris, France',
                'nationality' => 'French',
                'bio' => 'One of the most decorated chefs in the world, Alain Ducasse is a master of French haute cuisine and culinary philosophy.',
                'chef_image' => 'Alain_Ducasse.jpg',
            ],
            [
                'name' => 'Chef Moha',
                'email' => 'moha@homeflavors.com',
                'password' => 'password',
                'role' => 'cook',
                'status' => 'active',
                'phone' => '+212 524 100 300',
                'address' => 'Marrakesh, Morocco',
                'nationality' => 'Moroccan',
                'bio' => 'A pioneer of modern Moroccan gastronomy, Chef Moha revisits traditional dishes with creative flair at Dar Moha.',
                'chef_image' => 'Chef_Moha.jpg',
            ],
            [
                'name' => 'Ferrán Adrià',
                'email' => 'ferran@homeflavors.com',
                'password' => 'password',
                'role' => 'cook',
                'status' => 'active',
                'phone' => '+34 93 100 200',
                'address' => 'Barcelona, Spain',
                'nationality' => 'Spanish',
                'bio' => 'The father of molecular gastronomy and the genius behind elBulli, Ferrán Adrià changed the way the world thinks about food.',
                'chef_image' => 'Ferrán_Adrià.jpg',
            ],
            [
                'name' => 'Nusret Gökçe',
                'email' => 'nusret@homeflavors.com',
                'password' => 'password',
                'role' => 'cook',
                'status' => 'active',
                'phone' => '+90 212 100 200',
                'address' => 'Istanbul, Turkey',
                'nationality' => 'Turkish',
                'bio' => 'Known globally as Salt Bae, Nusret is a master butcher and restaurateur whose passion for meat has become a global phenomenon.',
                'chef_image' => 'Nusret_Gökçe.jpg',
            ],
            [
                'name' => 'Tim Mälzer',
                'email' => 'tim@homeflavors.com',
                'password' => 'password',
                'role' => 'cook',
                'status' => 'active',
                'phone' => '+49 40 100 200',
                'address' => 'Hamburg, Germany',
                'nationality' => 'German',
                'bio' => 'Germanys most energetic TV chef and restaurateur, Tim Mälzer is known for his straightforward approach and honest flavors.',
                'chef_image' => 'Tim_Mälzer.jpg',
            ],
            [
                'name' => 'Visitor User',
                'email' => 'visitor@homeflavors.com',
                'password' => 'password',
                'role' => 'customer',
                'status' => 'active',
                'phone' => '+212 600 555 100',
                'address' => 'Casablanca, Morocco',
            ],
        ];
    }
}
