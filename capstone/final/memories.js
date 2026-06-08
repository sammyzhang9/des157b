const MEMORIES = [
    {
        id: 'memory-1',
        timestamp: 'may 28, 2020 12:37:01 PM',
        image: 'images/neighborhood.png',
        phrase: 'i never walk through this part of the neighborhood',
        traits: ['quietness', 'belonging'],
        starColor: '#e8c4a0'
    },
    {
        id: 'memory-2',
        timestamp: 'aug 14, 2019 9:12:44 PM',
        image: 'images/kitchen.png',
        phrase: 'the kitchen light stayed on until everyone was home',
        traits: ['comfort', 'family'],
        starColor: '#f0d9a8'
    },
    {
        id: 'memory-3',
        timestamp: 'jan 3, 2021 6:05:18 AM',
        image: 'images/bus.png',
        phrase: 'we laughed so hard the bus driver looked back',
        traits: ['joy', 'friendship'],
        starColor: '#f5b8c4'
    },
    {
        id: 'memory-4',
        timestamp: 'oct 22, 2018 4:51:33 PM',
        image: 'images/snow.png',
        phrase: 'snow on the window made the world feel smaller',
        traits: ['quietness', 'comfort'],
        starColor: '#c9d8f0'
    },
    {
        id: 'memory-5',
        timestamp: 'jul 9, 2022 11:28:09 PM',
        image: 'images/yes.png',
        phrase: 'i said yes before i knew what i was agreeing to',
        traits: ['adventure', 'joy'],
        starColor: '#f2c6a0'
    },
    {
        id: 'memory-6',
        timestamp: 'mar 17, 2020 2:14:55 PM',
        image: 'images/handwriting.png',
        phrase: 'your handwriting was still on the back of my notebook',
        traits: ['love', 'nostalgia'],
        starColor: '#e6c8e8'
    },
    {
        id: 'memory-7',
        timestamp: 'dec 1, 2017 8:40:02 AM',
        image: 'images/hill.png',
        phrase: 'the hill looked longer from the bottom than i remembered',
        traits: ['adventure', 'quietness'],
        starColor: '#d4e4c8'
    },
    {
        id: 'memory-8',
        timestamp: 'apr 30, 2023 7:03:41 PM',
        image: 'images/city.png',
        phrase: 'we stayed up all night in a new city',
        traits: ['adventure', 'joy'],
        starColor: '#d9cfc4'
    },
    {
        id: 'memory-9',
        timestamp: 'feb 10, 2018 6:42:19 PM',
        image: 'images/table.png',
        phrase: 'the table was loud before the food even arrived',
        traits: ['family', 'belonging'],
        starColor: '#f2c6a0'
    },
    {
        id: 'memory-10',
        timestamp: 'jan 25, 2020 10:33:47 PM',
        image: 'images/meal.png',
        phrase: 'you put more food on my plate than i could eat',
        traits: ['love', 'family'],
        starColor: '#f5b8c4'
    },
    {
        id: 'memory-11',
        timestamp: 'jun 12, 2017 4:08:55 PM',
        image: 'images/song.png',
        phrase: 'the song came on and suddenly i was twelve again dancing in the living room',
        traits: ['nostalgia', 'joy'],
        starColor: '#f0d9a8'
    },
    {
        id: 'memory-12',
        timestamp: 'mar 14, 2020 1:19:08 AM',
        image: 'images/talk.png',
        phrase: 'we spent the night talking about everything and nothing',
        traits: ['love', 'nostalgia'],
        starColor: '#e6c8e8'
    },
    {
        id: 'memory-13',
        timestamp: 'may 2, 2023 6:04:17 PM',
        image: 'images/how-i-like.png',
        phrase: 'you remembered how i liked it without asking',
        traits: ['love', 'comfort'],
        starColor: '#f3c7d2'
    }
];

const TOTAL_MEMORIES = MEMORIES.length;

const TRAIT_REFLECTIONS = {
    quietness: 'stillness stayed with you',
    belonging: 'belonging stayed with you',
    comfort: 'warmth stayed with you',
    joy: 'lightness stayed with you',
    friendship: 'friendship stayed with you',
    adventure: 'risk stayed with you',
    family: 'home stayed with you',
    love: 'tenderness stayed with you',
    nostalgia: 'the past stayed with you',
    childhood: 'your younger self stayed with you'
};

const LETTING_GO_REFLECTION = 'The memories you let go of do not disappear because they were meaningless. They become softer, making room for the ones that still feel important to carry.';

const CLOSING_STATEMENT = 'The memories you chose are a small map of who you are today.';

const MAX_SAVED_MEMORIES = 5;
