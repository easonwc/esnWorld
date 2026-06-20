type AthleteGender = "male" | "female";

export type AthleteNameCulture =
  | "english_american"
  | "english_british"
  | "english_oceania"
  | "spanish"
  | "portuguese"
  | "french"
  | "french_african"
  | "german"
  | "italian"
  | "dutch"
  | "nordic"
  | "slavic"
  | "ukrainian"
  | "polish"
  | "czech"
  | "hungarian"
  | "greek"
  | "turkish"
  | "arabic"
  | "persian"
  | "hebrew"
  | "chinese"
  | "japanese"
  | "korean"
  | "hindi"
  | "pakistani"
  | "bengali"
  | "thai"
  | "vietnamese"
  | "indonesian"
  | "filipino"
  | "malay"
  | "swahili"
  | "yoruba"
  | "amharic"
  | "south_african"
  | "romanian";

interface NamePool {
  maleGiven: readonly string[];
  femaleGiven: readonly string[];
  family: readonly string[];
}

const ENGLISH_AMERICAN: NamePool = {
  maleGiven: [
    "James", "Michael", "David", "Daniel", "Matthew", "Andrew", "Robert", "William",
    "Thomas", "Christopher", "Ryan", "Kevin", "Brian", "Jason", "Eric", "Mark",
    "Steven", "Paul", "Scott", "Patrick", "Anthony", "Joshua", "Justin", "Brandon",
    "Tyler", "Kyle", "Derek", "Gregory", "Raymond", "Timothy", "Jonathan", "Nathan",
  ],
  femaleGiven: [
    "Emma", "Olivia", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper",
    "Evelyn", "Abigail", "Emily", "Elizabeth", "Avery", "Ella", "Madison", "Scarlett",
    "Victoria", "Grace", "Chloe", "Hannah", "Natalie", "Samantha", "Ashley", "Lauren",
    "Rachel", "Megan", "Allison", "Brooke", "Taylor", "Kayla", "Jennifer", "Nicole",
  ],
  family: [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia",
    "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Moore", "Jackson",
    "Martin", "Thompson", "White", "Harris", "Clark", "Lewis", "Walker", "Hall",
    "Allen", "Young", "King", "Wright", "Scott", "Green", "Adams", "Baker", "Nelson", "Carter",
  ],
};

const ENGLISH_BRITISH: NamePool = {
  maleGiven: [
    "Oliver", "George", "Harry", "Jack", "Jacob", "Charlie", "Thomas", "Oscar",
    "William", "James", "Henry", "Alfie", "Joshua", "Freddie", "Archie", "Leo",
    "Arthur", "Alexander", "Edward", "Benjamin", "Samuel", "Daniel", "Joseph", "Lucas",
    "Max", "Ethan", "Mohammed", "Noah", "Finley", "Theo", "Isaac", "Reuben",
  ],
  femaleGiven: [
    "Olivia", "Amelia", "Isla", "Ava", "Emily", "Poppy", "Isabella", "Jessica",
    "Lily", "Sophie", "Mia", "Evie", "Grace", "Freya", "Charlotte", "Sienna",
    "Daisy", "Phoebe", "Florence", "Alice", "Ruby", "Ella", "Rosie", "Matilda",
    "Harriet", "Imogen", "Chloe", "Lucy", "Evelyn", "Zara", "Hannah", "Georgia",
  ],
  family: [
    "Smith", "Jones", "Williams", "Taylor", "Brown", "Davies", "Evans", "Wilson",
    "Thomas", "Roberts", "Johnson", "Walker", "Wright", "Thompson", "Robinson", "White",
    "Hall", "Green", "Edwards", "Clark", "Lewis", "Harris", "Scott", "Morgan",
    "Cooper", "King", "Baker", "Hughes", "Phillips", "Campbell", "Stewart", "Murray",
  ],
};

const JAPANESE: NamePool = {
  maleGiven: [
    "Haruto", "Yuto", "Sota", "Ren", "Hiroto", "Takumi", "Daiki", "Kenta",
    "Ryo", "Shota", "Kaito", "Hayato", "Yuki", "Sora", "Tsubasa", "Kenji",
    "Takeshi", "Naoki", "Shinji", "Kazuki", "Riku", "Minato", "Asahi", "Itsuki",
    "Taiga", "Ryota", "Kohei", "Masato", "Yuji", "Akira", "Hinata", "Toma",
  ],
  femaleGiven: [
    "Yui", "Hina", "Sakura", "Aoi", "Mei", "Rin", "Yuna", "Mio",
    "Himari", "Ichika", "Akari", "Sara", "Nanami", "Misaki", "Nana", "Ayaka",
    "Haruka", "Yuka", "Emi", "Kana", "Miyu", "Riko", "Saki", "Noa",
    "Koharu", "Hana", "Miyabi", "Asuka", "Natsuki", "Reina", "Mika", "Yoko",
  ],
  family: [
    "Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura",
    "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto", "Inoue",
    "Kimura", "Hayashi", "Shimizu", "Yamazaki", "Mori", "Abe", "Ikeda", "Hashimoto",
    "Ishikawa", "Maeda", "Fujita", "Ogawa", "Goto", "Okada", "Hasegawa", "Murakami",
  ],
};

const CHINESE: NamePool = {
  maleGiven: [
    "Wei", "Ming", "Jun", "Lei", "Hao", "Chen", "Yi", "Jian",
    "Tao", "Feng", "Bo", "Peng", "Kai", "Xiang", "Yong", "Gang",
    "Bin", "Qiang", "Tian", "Long", "Zhi", "Rui", "Han", "Lin",
    "Yuan", "Cheng", "Dong", "Guang", "Jie", "Liang", "Shuo", "Xin",
  ],
  femaleGiven: [
    "Li", "Mei", "Yan", "Jing", "Fang", "Na", "Xiu", "Ling",
    "Ying", "Hui", "Lan", "Xin", "Yu", "Min", "Juan", "Ping",
    "Qing", "Shan", "Ting", "Wen", "Xia", "Yue", "Zhen", "Hong",
    "Lu", "Rong", "Shu", "Xi", "Yun", "An", "Dan", "Fen",
  ],
  family: [
    "Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao",
    "Wu", "Zhou", "Xu", "Sun", "Ma", "Zhu", "Hu", "Guo",
    "Lin", "He", "Gao", "Luo", "Zheng", "Liang", "Song", "Tang",
    "Xie", "Han", "Deng", "Feng", "Cao", "Peng", "Su", "Lu",
  ],
};

const KOREAN: NamePool = {
  maleGiven: [
    "Min-jun", "Seo-jun", "Do-yun", "Ye-jun", "Si-woo", "Ha-jun", "Ju-won", "Gun-woo",
    "Woo-jin", "Hyun-woo", "Jun-seo", "Ji-ho", "Seung-min", "Dong-hyun", "Jae-won", "Sang-hoon",
    "Tae-yang", "Kyung-soo", "Jin-ho", "Young-min", "Sung-ho", "Chang-min", "Joon-ho", "Myung-soo",
    "Hwan-woo", "In-ho", "Kwang-soo", "Nam-joon", "Seok-jin", "Tae-hyun", "Won-ho", "Yong-jun",
  ],
  femaleGiven: [
    "Seo-yeon", "Ji-woo", "Ha-yoon", "Seo-hyun", "Ji-yu", "Chae-won", "Su-bin", "Ye-eun",
    "Min-seo", "Ha-eun", "Yoon-seo", "Ji-min", "Da-eun", "So-yeon", "Hye-jin", "Eun-ji",
    "Yoo-jin", "Na-yeon", "Bo-ra", "Hee-jin", "Kyung-hee", "Mi-ra", "Sun-hee", "Young-hee",
    "Ae-ri", "Bo-young", "Eun-young", "Ga-in", "Hae-won", "In-young", "Jung-eun", "Soo-jin",
  ],
  family: [
    "Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon",
    "Jang", "Lim", "Han", "Shin", "Oh", "Seo", "Kwon", "Hwang",
    "Ahn", "Song", "Hong", "Yang", "Baek", "Heo", "Nam", "Ryu",
    "Noh", "Moon", "Ko", "Min", "Bae", "Son", "Jeon", "Cha",
  ],
};

const SPANISH: NamePool = {
  maleGiven: [
    "Alejandro", "Carlos", "Diego", "Javier", "Miguel", "Antonio", "Francisco", "Jose",
    "Manuel", "Pedro", "Rafael", "Sergio", "Fernando", "Ricardo", "Andres", "Luis",
    "Pablo", "Daniel", "Adrian", "Marcos", "Raul", "Enrique", "Victor", "Alberto",
    "Roberto", "Eduardo", "Ignacio", "Alfonso", "Emilio", "Felipe", "Gabriel", "Hector",
  ],
  femaleGiven: [
    "Maria", "Carmen", "Ana", "Isabel", "Laura", "Lucia", "Elena", "Sofia",
    "Paula", "Marta", "Claudia", "Beatriz", "Cristina", "Raquel", "Patricia", "Rosa",
    "Teresa", "Silvia", "Nuria", "Alba", "Carla", "Irene", "Julia", "Andrea",
    "Monica", "Veronica", "Pilar", "Dolores", "Mercedes", "Esperanza", "Ines", "Valeria",
  ],
  family: [
    "Garcia", "Rodriguez", "Martinez", "Lopez", "Gonzalez", "Hernandez", "Perez", "Sanchez",
    "Ramirez", "Torres", "Flores", "Rivera", "Gomez", "Diaz", "Reyes", "Morales",
    "Cruz", "Ortiz", "Gutierrez", "Chavez", "Ramos", "Vargas", "Castillo", "Jimenez",
    "Ruiz", "Mendoza", "Aguilar", "Medina", "Castro", "Romero", "Herrera", "Navarro",
  ],
};

const HINDI: NamePool = {
  maleGiven: [
    "Arjun", "Rahul", "Amit", "Vikram", "Rohan", "Sanjay", "Rajesh", "Anil",
    "Deepak", "Manoj", "Suresh", "Ravi", "Karan", "Nikhil", "Aditya", "Varun",
    "Akash", "Pranav", "Siddharth", "Harsh", "Yash", "Dev", "Kabir", "Ishaan",
    "Vivek", "Gaurav", "Ashok", "Sunil", "Mahesh", "Naveen", "Pankaj", "Tarun",
  ],
  femaleGiven: [
    "Priya", "Ananya", "Kavya", "Neha", "Pooja", "Anjali", "Shreya", "Divya",
    "Aisha", "Meera", "Riya", "Sneha", "Nisha", "Kiran", "Lakshmi", "Sunita",
    "Geeta", "Rekha", "Swati", "Tanvi", "Isha", "Aditi", "Bhavna", "Chitra",
    "Deepika", "Jyoti", "Kriti", "Manisha", "Payal", "Radha", "Sapna", "Vidya",
  ],
  family: [
    "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Reddy", "Iyer", "Nair",
    "Mehta", "Shah", "Joshi", "Desai", "Kapoor", "Malhotra", "Chopra", "Verma",
    "Agarwal", "Banerjee", "Das", "Rao", "Pillai", "Menon", "Khan", "Mishra",
    "Pandey", "Tiwari", "Saxena", "Bhat", "Chauhan", "Dubey", "Goyal", "Khanna",
  ],
};

const ARABIC: NamePool = {
  maleGiven: [
    "Mohammed", "Ahmed", "Ali", "Omar", "Hassan", "Ibrahim", "Khalid", "Youssef",
    "Abdullah", "Mustafa", "Tariq", "Faisal", "Saeed", "Hamza", "Karim", "Nasser",
    "Rashid", "Salim", "Walid", "Zaid", "Amir", "Bilal", "Farid", "Jamal",
    "Kamal", "Mahmoud", "Nabil", "Osman", "Qasim", "Samir", "Tamer", "Yasin",
  ],
  femaleGiven: [
    "Fatima", "Aisha", "Mariam", "Layla", "Noor", "Sara", "Hana", "Yasmin",
    "Amira", "Dina", "Leila", "Nadia", "Rania", "Salma", "Zainab", "Huda",
    "Iman", "Jana", "Lina", "Mona", "Noura", "Rana", "Samira", "Dalia",
    "Farah", "Ghada", "Hala", "Jamila", "Karima", "Lamia", "Maha", "Reem",
  ],
  family: [
    "Al-Farsi", "Al-Hassan", "Al-Rashid", "Al-Saud", "Al-Masri", "Al-Najjar", "Al-Qasim", "Al-Zahra",
    "Haddad", "Khalil", "Mansour", "Nasser", "Saleh", "Taha", "Youssef", "Zayed",
    "Abadi", "Barakat", "Darwish", "Fahmy", "Ghanem", "Habib", "Issa", "Jaber",
    "Karam", "Latif", "Maalouf", "Najm", "Obeid", "Qureshi", "Rahman", "Shams",
  ],
};

const FRENCH: NamePool = {
  maleGiven: [
    "Louis", "Gabriel", "Raphael", "Arthur", "Jules", "Adam", "Lucas", "Hugo",
    "Nathan", "Ethan", "Theo", "Tom", "Antoine", "Maxime", "Alexandre", "Pierre",
    "Nicolas", "Francois", "Henri", "Philippe", "Laurent", "Olivier", "Christophe", "Sebastien",
    "Matthieu", "Vincent", "Benjamin", "Clement", "Damien", "Emmanuel", "Fabien", "Guillaume",
  ],
  femaleGiven: [
    "Emma", "Jade", "Louise", "Alice", "Chloe", "Lina", "Lea", "Manon",
    "Camille", "Ines", "Sarah", "Zoe", "Clara", "Juliette", "Marie", "Sophie",
    "Isabelle", "Nathalie", "Celine", "Audrey", "Caroline", "Elise", "Florence", "Helene",
    "Julie", "Margaux", "Noemie", "Pauline", "Sandrine", "Valerie", "Amelie", "Brigitte",
  ],
  family: [
    "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand",
    "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David",
    "Bertrand", "Roux", "Vincent", "Fournier", "Morel", "Girard", "Andre", "Mercier",
    "Dupont", "Lambert", "Bonnet", "Francois", "Martinez", "Legrand", "Garnier", "Faure",
  ],
};

const GERMAN: NamePool = {
  maleGiven: [
    "Lukas", "Leon", "Finn", "Paul", "Jonas", "Ben", "Noah", "Elias",
    "Felix", "Maximilian", "Tim", "Niklas", "Jan", "Moritz", "Philipp", "Tobias",
    "Sebastian", "Florian", "Markus", "Stefan", "Thomas", "Andreas", "Christian", "Daniel",
    "Michael", "Alexander", "Matthias", "Oliver", "Patrick", "Ralf", "Sven", "Wolfgang",
  ],
  femaleGiven: [
    "Mia", "Emma", "Hannah", "Sophia", "Anna", "Lena", "Marie", "Lea",
    "Laura", "Sarah", "Julia", "Katharina", "Lisa", "Nina", "Claudia", "Sabine",
    "Petra", "Monika", "Andrea", "Susanne", "Christina", "Stefanie", "Melanie", "Nicole",
    "Sandra", "Tanja", "Katrin", "Heike", "Birgit", "Anja", "Silke", "Kerstin",
  ],
  family: [
    "Muller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker",
    "Schulz", "Hoffmann", "Schafer", "Koch", "Bauer", "Richter", "Klein", "Wolf",
    "Schroder", "Neumann", "Schwarz", "Zimmermann", "Braun", "Krause", "Hartmann", "Lange",
    "Werner", "Schmitt", "Krüger", "Lehmann", "Huber", "Kaiser", "Fuchs", "Peters",
  ],
};

const PORTUGUESE: NamePool = {
  maleGiven: [
    "Joao", "Pedro", "Lucas", "Gabriel", "Matheus", "Rafael", "Bruno", "Felipe",
    "Gustavo", "Diego", "Thiago", "Leonardo", "Rodrigo", "Marcelo", "Andre", "Carlos",
    "Paulo", "Ricardo", "Fernando", "Eduardo", "Antonio", "Francisco", "Henrique", "Vitor",
    "Caio", "Daniel", "Eduardo", "Fabio", "Guilherme", "Igor", "Julio", "Renato",
  ],
  femaleGiven: [
    "Ana", "Maria", "Julia", "Beatriz", "Larissa", "Camila", "Amanda", "Fernanda",
    "Patricia", "Carla", "Mariana", "Gabriela", "Leticia", "Renata", "Adriana", "Claudia",
    "Daniela", "Helena", "Isabela", "Luiza", "Natalia", "Paula", "Raquel", "Sofia",
    "Tatiana", "Vanessa", "Viviane", "Aline", "Bianca", "Debora", "Eliane", "Priscila",
  ],
  family: [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira",
    "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Araujo", "Melo",
    "Barbosa", "Cardoso", "Correia", "Dias", "Freitas", "Lopes", "Moura", "Nunes",
    "Pinto", "Ramos", "Reis", "Teixeira", "Vieira", "Castro", "Monteiro", "Nascimento",
  ],
};

const ITALIAN: NamePool = {
  maleGiven: [
    "Marco", "Luca", "Giuseppe", "Francesco", "Alessandro", "Andrea", "Matteo", "Lorenzo",
    "Giovanni", "Antonio", "Stefano", "Roberto", "Paolo", "Davide", "Simone", "Fabio",
    "Claudio", "Daniele", "Emanuele", "Filippo", "Gianluca", "Leonardo", "Massimo", "Nicola",
    "Pietro", "Riccardo", "Salvatore", "Tommaso", "Valerio", "Vincenzo", "Alberto", "Enrico",
  ],
  femaleGiven: [
    "Giulia", "Francesca", "Chiara", "Sara", "Valentina", "Alessia", "Martina", "Elisa",
    "Federica", "Silvia", "Laura", "Anna", "Maria", "Paola", "Roberta", "Stefania",
    "Claudia", "Elena", "Gabriella", "Isabella", "Lucia", "Monica", "Patrizia", "Rosa",
    "Serena", "Teresa", "Veronica", "Antonella", "Barbara", "Cristina", "Daniela", "Giovanna",
  ],
  family: [
    "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci",
    "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa",
    "Giordano", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro", "Mariani",
    "Rinaldi", "Caruso", "Ferrara", "Galli", "Martini", "Leone", "Longo", "Gentile",
  ],
};

const SLAVIC: NamePool = {
  maleGiven: [
    "Ivan", "Dmitri", "Alexei", "Sergei", "Nikolai", "Vladimir", "Andrei", "Mikhail",
    "Pavel", "Yuri", "Oleg", "Maxim", "Artem", "Kirill", "Roman", "Denis",
    "Anton", "Boris", "Egor", "Fedor", "Grigory", "Igor", "Konstantin", "Leonid",
    "Mark", "Nikita", "Pyotr", "Stanislav", "Timur", "Vadim", "Viktor", "Yaroslav",
  ],
  femaleGiven: [
    "Anna", "Maria", "Elena", "Olga", "Tatiana", "Natalia", "Irina", "Svetlana",
    "Ekaterina", "Yulia", "Anastasia", "Daria", "Polina", "Vera", "Ludmila", "Galina",
    "Inna", "Ksenia", "Larisa", "Marina", "Nina", "Oksana", "Sofia", "Valentina",
    "Viktoria", "Yelena", "Zhanna", "Alina", "Irada", "Karina", "Lyudmila", "Tamara",
  ],
  family: [
    "Ivanov", "Smirnov", "Kuznetsov", "Popov", "Sokolov", "Lebedev", "Kozlov", "Novikov",
    "Morozov", "Petrov", "Volkov", "Solovyov", "Vasilyev", "Zaitsev", "Pavlov", "Semenov",
    "Golubev", "Vinogradov", "Bogdanov", "Vorobyov", "Fedorov", "Mikhailov", "Belyaev", "Tarasov",
    "Belov", "Komarov", "Orlov", "Kiselev", "Makarov", "Andreev", "Kovalev", "Ilyin",
  ],
};

const THAI: NamePool = {
  maleGiven: [
    "Somchai", "Somsak", "Prasert", "Anan", "Kittisak", "Wichai", "Surachai", "Niran",
    "Apichat", "Chaiwat", "Thanawat", "Piyapong", "Suthep", "Wichit", "Arthit", "Boonchai",
    "Chatchai", "Decha", "Ekachai", "Kriengsak", "Manop", "Narong", "Phong", "Rattana",
    "Santi", "Thana", "Udom", "Viroj", "Wanchai", "Yutthana", "Adisak", "Bancha",
  ],
  femaleGiven: [
    "Siriporn", "Nittaya", "Malee", "Duangjai", "Pornthip", "Wanida", "Suda", "Kanya",
    "Arunee", "Busaba", "Chutima", "Darunee", "Jintana", "Kanokwan", "Ladda", "Mali",
    "Nonglak", "Orathai", "Pensri", "Ratree", "Siriwan", "Thanyarat", "Ubon", "Wipada",
    "Yupin", "Anchalee", "Benjamas", "Chalida", "Dawan", "Ekkachai", "Fah", "Gamon",
  ],
  family: [
    "Saetang", "Chaiyasit", "Wongsuwan", "Thongchai", "Rattanakorn", "Boonma", "Srisai", "Kaewkhao",
    "Phromma", "Sukhum", "Chaimongkol", "Netrakan", "Phetcharat", "Siriwat", "Tancharoen", "Vongvanij",
    "Wannasiri", "Yodphet", "Arunrung", "Bunprasit", "Chansiri", "Dechakorn", "Intarak", "Khamchan",
    "Lertpanya", "Maneerat", "Nopparat", "Prasert", "Rattana", "Sawatdee", "Thongyoo", "Udomsak",
  ],
};

const VIETNAMESE: NamePool = {
  maleGiven: [
    "Minh", "Anh", "Duc", "Huy", "Khang", "Long", "Nam", "Phong",
    "Quang", "Son", "Tuan", "Vinh", "Binh", "Cuong", "Dung", "Hai",
    "Hoang", "Hung", "Khoa", "Linh", "Nghia", "Phuc", "Tai", "Thang",
    "Thanh", "Trung", "Van", "Vu", "Bao", "Dat", "Giang", "Kien",
  ],
  femaleGiven: [
    "Lan", "Huong", "Mai", "Linh", "Trang", "Ha", "Ngoc", "Thao",
    "Anh", "Chi", "Dung", "Giang", "Hanh", "Hien", "Hong", "Khanh",
    "Lien", "My", "Nhung", "Phuong", "Quyen", "Tam", "Thuy", "Van",
    "Vy", "Yen", "Bich", "Cam", "Dao", "Hoa", "Kieu", "Nga",
  ],
  family: [
    "Nguyen", "Tran", "Le", "Pham", "Hoang", "Huynh", "Phan", "Vu",
    "Vo", "Dang", "Bui", "Do", "Ngo", "Duong", "Ly", "Truong",
    "Dinh", "Luu", "Mai", "Cao", "Dao", "Lam", "Ta", "Thai",
    "Ton", "Chu", "Ha", "Kieu", "Luong", "Quach", "Tong", "Vi",
  ],
};

const INDONESIAN: NamePool = {
  maleGiven: [
    "Budi", "Agus", "Hendra", "Rizky", "Adi", "Eko", "Joko", "Putra",
    "Rudi", "Wayan", "Made", "Nyoman", "Ketut", "Ahmad", "Bambang", "Dedi",
    "Fajar", "Gunawan", "Hadi", "Iwan", "Jaya", "Kurnia", "Lukman", "Nanda",
    "Oki", "Prasetyo", "Rahmat", "Surya", "Teguh", "Umar", "Wahyu", "Yoga",
  ],
  femaleGiven: [
    "Siti", "Dewi", "Putri", "Rina", "Ayu", "Indah", "Kartika", "Lestari",
    "Maya", "Novi", "Ratna", "Sri", "Tri", "Wati", "Yuni", "Ani",
    "Citra", "Dian", "Eka", "Fitri", "Gita", "Hani", "Intan", "Julia",
    "Kartini", "Lina", "Mega", "Nita", "Puspita", "Rani", "Sari", "Tari",
  ],
  family: [
    "Sutrisno", "Wijaya", "Pratama", "Susanto", "Hidayat", "Saputra", "Kusuma", "Setiawan",
    "Nugroho", "Santoso", "Wibowo", "Permana", "Rahman", "Halim", "Gunawan", "Utomo",
    "Purnama", "Mahendra", "Anggraini", "Lestari", "Cahyono", "Hartono", "Iskandar", "Nasution",
    "Simanjuntak", "Siregar", "Pane", "Lubis", "Hasibuan", "Dalimunthe", "Harahap", "Ritonga",
  ],
};

const FILIPINO: NamePool = {
  maleGiven: [
    "Jose", "Juan", "Antonio", "Francisco", "Manuel", "Pedro", "Ramon", "Ricardo",
    "Carlos", "Miguel", "Rafael", "Gabriel", "Angelo", "Mark", "John", "Michael",
    "Christian", "Adrian", "Paolo", "Luis", "Daniel", "Emmanuel", "Jerome", "Kevin",
    "Ryan", "Bryan", "Jason", "Allan", "Arnold", "Benjamin", "Cedric", "Dominic",
  ],
  femaleGiven: [
    "Maria", "Ana", "Grace", "Angelica", "Christine", "Michelle", "Jennifer", "Patricia",
    "Rose", "Mary", "Catherine", "Elizabeth", "Margaret", "Teresa", "Josephine", "Cristina",
    "Joy", "Faith", "Hope", "Charity", "Abigail", "Beatrice", "Clarissa", "Diana",
    "Elena", "Frances", "Gina", "Helen", "Irene", "Jasmine", "Karen", "Lea",
  ],
  family: [
    "Santos", "Reyes", "Cruz", "Bautista", "Garcia", "Mendoza", "Torres", "Flores",
    "Gonzales", "Ramos", "Aquino", "Castillo", "Rivera", "Dela Cruz", "Lopez", "Morales",
    "Fernandez", "Domingo", "Valdez", "Romero", "Navarro", "Salazar", "Pascual", "Mercado",
    "Santiago", "Velasco", "Aguilar", "Perez", "Diaz", "Villanueva", "Manalo", "Tolentino",
  ],
};

const SWAHILI: NamePool = {
  maleGiven: [
    "Juma", "Baraka", "Hamisi", "Rajabu", "Omari", "Salim", "Hassan", "Ali",
    "Musa", "Issa", "Abdul", "Emmanuel", "Joseph", "Peter", "John", "Samuel",
    "Daniel", "David", "James", "Michael", "Patrick", "Stephen", "Vincent", "Francis",
    "George", "Paul", "Simon", "Thomas", "William", "Charles", "Robert", "Martin",
  ],
  femaleGiven: [
    "Amina", "Fatuma", "Halima", "Mariam", "Neema", "Pendo", "Rehema", "Salma",
    "Zainab", "Grace", "Mary", "Elizabeth", "Sarah", "Ruth", "Esther", "Joyce",
    "Agnes", "Alice", "Catherine", "Dorothy", "Florence", "Helen", "Jane", "Lucy",
    "Margaret", "Naomi", "Patricia", "Rose", "Susan", "Teresa", "Victoria", "Winnie",
  ],
  family: [
    "Mwangi", "Otieno", "Kamau", "Ochieng", "Kipchoge", "Njoroge", "Wanjiru", "Mutua",
    "Kimani", "Odhiambo", "Kibet", "Cheruiyot", "Rotich", "Korir", "Langat", "Bett",
    "Kipruto", "Tanui", "Keino", "Boit", "Sang", "Rono", "Chepkoech", "Jepkosgei",
    "Wambui", "Akinyi", "Adhiambo", "Anyango", "Atieno", "Awuor", "Akoth", "Achieng",
  ],
};

const YORUBA: NamePool = {
  maleGiven: [
    "Adebayo", "Olumide", "Tunde", "Segun", "Femi", "Kunle", "Bola", "Yemi",
    "Chidi", "Emeka", "Obinna", "Ifeanyi", "Chukwudi", "Nnamdi", "Tobi", "Kelechi",
    "Uche", "Ikenna", "Chinedu", "Oluwaseun", "Ayodele", "Babajide", "Damilola", "Eniola",
    "Gbenga", "Jide", "Kayode", "Lekan", "Muyiwa", "Niyi", "Rotimi", "Wale",
  ],
  femaleGiven: [
    "Adunni", "Folake", "Yetunde", "Bisi", "Ngozi", "Amaka", "Chioma", "Adaeze",
    "Funke", "Titilayo", "Simisola", "Omolara", "Aisha", "Halima", "Zainab", "Blessing",
    "Gift", "Precious", "Faith", "Hope", "Joy", "Grace", "Mercy", "Patience",
    "Chiamaka", "Ebere", "Ifeoma", "Nkechi", "Ogechi", "Uchenna", "Yewande", "Zainab",
  ],
  family: [
    "Adeyemi", "Okafor", "Okonkwo", "Eze", "Nwankwo", "Obi", "Okoro", "Igwe",
    "Afolabi", "Babatunde", "Ogundimu", "Oladipo", "Akinyemi", "Ogunleye", "Onyekachi", "Chukwu",
    "Abubakar", "Bello", "Ibrahim", "Musa", "Yusuf", "Aliyu", "Sani", "Garba",
    "Ojo", "Akinwale", "Fashola", "Osinbajo", "Okoye", "Nwosu", "Agu", "Nnamani",
  ],
};

const SOUTH_AFRICAN: NamePool = {
  maleGiven: [
    "Sipho", "Thabo", "Mandla", "Bongani", "Lungile", "Sibusiso", "Themba", "Vusi",
    "Pieter", "Johan", "Willem", "Francois", "Hendrik", "Stefan", "Jacques", "Danie",
    "David", "Michael", "James", "Daniel", "John", "Peter", "Andrew", "Thomas",
    "Liam", "Ethan", "Noah", "Luka", "Kyle", "Ryan", "Brandon", "Justin",
  ],
  femaleGiven: [
    "Nomsa", "Thandi", "Zanele", "Lerato", "Precious", "Nomvula", "Busisiwe", "Nolwazi",
    "Annelize", "Elize", "Marietjie", "Sanet", "Chanel", "Bianca", "Michelle", "Natasha",
    "Sarah", "Emily", "Jessica", "Lauren", "Nicole", "Rachel", "Rebecca", "Samantha",
    "Amanda", "Lisa", "Karen", "Susan", "Linda", "Patricia", "Elizabeth", "Mary",
  ],
  family: [
    "Nkosi", "Dlamini", "Mthembu", "Khumalo", "Ndlovu", "Zulu", "Mokoena", "Molefe",
    "Van der Merwe", "Botha", "Pretorius", "Du Plessis", "Nel", "Fourie", "Meyer", "Kruger",
    "Smith", "Jones", "Williams", "Brown", "Patel", "Singh", "Naidoo", "Pillay",
    "Govender", "Reddy", "Maharaj", "Chetty", "Moodley", "Petersen", "Adams", "Jacobs",
  ],
};

const TURKISH: NamePool = {
  maleGiven: [
    "Mehmet", "Mustafa", "Ahmet", "Ali", "Huseyin", "Hasan", "Ibrahim", "Ismail",
    "Osman", "Yusuf", "Murat", "Emre", "Burak", "Cem", "Deniz", "Eren",
    "Kerem", "Onur", "Serkan", "Tolga", "Umut", "Volkan", "Baris", "Can",
    "Ege", "Kaan", "Mert", "Omer", "Selim", "Taner", "Ufuk", "Yasin",
  ],
  femaleGiven: [
    "Ayse", "Fatma", "Emine", "Hatice", "Zeynep", "Elif", "Merve", "Busra",
    "Esra", "Seda", "Derya", "Gul", "Hande", "Irem", "Melis", "Naz",
    "Pinar", "Selin", "Tugba", "Yasemin", "Asli", "Berna", "Cansu", "Defne",
    "Ebru", "Fulya", "Gamze", "Hilal", "Jale", "Kubra", "Lale", "Nihan",
  ],
  family: [
    "Yilmaz", "Kaya", "Demir", "Celik", "Sahin", "Yildiz", "Yildirim", "Ozturk",
    "Aydin", "Ozdemir", "Arslan", "Dogan", "Kilic", "Aslan", "Cetin", "Kara",
    "Kurt", "Polat", "Simsek", "Erdogan", "Aksoy", "Bulut", "Gunes", "Tekin",
    "Unal", "Acar", "Bozkurt", "Cakir", "Erden", "Guler", "Kaplan", "Turan",
  ],
};

const PERSIAN: NamePool = {
  maleGiven: [
    "Ali", "Mohammad", "Reza", "Hossein", "Amir", "Saeed", "Mehdi", "Hamid",
    "Javad", "Masoud", "Nader", "Parviz", "Behnam", "Farhad", "Kamran", "Omid",
    "Payam", "Ramin", "Siamak", "Vahid", "Arash", "Babak", "Cyrus", "Dariush",
    "Ehsan", "Farshad", "Gholam", "Hamed", "Iman", "Kaveh", "Maziar", "Navid",
  ],
  femaleGiven: [
    "Maryam", "Fatemeh", "Zahra", "Sara", "Narges", "Leila", "Shirin", "Parisa",
    "Nasrin", "Golnaz", "Mahsa", "Niloufar", "Roya", "Simin", "Taraneh", "Yasmin",
    "Azadeh", "Banafsheh", "Donya", "Elham", "Fariba", "Gitty", "Homa", "Jaleh",
    "Katayoun", "Ladan", "Mina", "Nazanin", "Pari", "Roxana", "Setareh", "Tara",
  ],
  family: [
    "Ahmadi", "Hosseini", "Mohammadi", "Rezaei", "Karimi", "Moradi", "Rahmani", "Azizi",
    "Ebrahimi", "Ghasemi", "Hashemi", "Jafari", "Kazemi", "Mousavi", "Najafi", "Rostami",
    "Sharifi", "Taheri", "Zare", "Bagheri", "Farahani", "Gholami", "Heidari", "Khosravi",
    "Mirzaei", "Nouri", "Pakravan", "Salehi", "Tavakoli", "Yousefi", "Amiri", "Bakhtiari",
  ],
};

const HEBREW: NamePool = {
  maleGiven: [
    "David", "Yosef", "Moshe", "Avraham", "Yitzhak", "Yaakov", "Daniel", "Noam",
    "Ariel", "Eitan", "Itai", "Lior", "Omer", "Ron", "Tal", "Yuval",
    "Amir", "Barak", "Dor", "Eyal", "Gal", "Ido", "Nir", "Shai",
    "Tom", "Uri", "Yair", "Ziv", "Adam", "Ben", "Elad", "Guy",
  ],
  femaleGiven: [
    "Noa", "Maya", "Tamar", "Yael", "Shira", "Avigail", "Eden", "Lia",
    "Maayan", "Roni", "Ayelet", "Dana", "Hila", "Inbar", "Keren", "Lihi",
    "Michal", "Noga", "Orly", "Rachel", "Sarah", "Tal", "Vered", "Yarden",
    "Adi", "Batya", "Chen", "Dafna", "Efrat", "Galit", "Hannah", "Irit",
  ],
  family: [
    "Cohen", "Levi", "Mizrahi", "Peretz", "Biton", "Dahan", "Avraham", "Friedman",
    "Katz", "Goldberg", "Shapiro", "Rosen", "Klein", "Weiss", "Stein", "Golan",
    "Barak", "Erez", "Gabay", "Harel", "Israeli", "Koren", "Lavi", "Mor",
    "Nagar", "Oren", "Peled", "Raz", "Saban", "Tal", "Vaknin", "Zohar",
  ],
};

const PAKISTANI: NamePool = {
  maleGiven: [
    "Muhammad", "Ahmed", "Ali", "Hassan", "Usman", "Bilal", "Imran", "Faisal",
    "Kamran", "Tariq", "Asad", "Hamza", "Saad", "Zain", "Arslan", "Farhan",
    "Haider", "Irfan", "Junaid", "Kashif", "Nadeem", "Omar", "Rashid", "Shahid",
    "Waqar", "Yasir", "Adnan", "Basit", "Danish", "Ehsan", "Ghulam", "Haris",
  ],
  femaleGiven: [
    "Ayesha", "Fatima", "Zainab", "Hira", "Sana", "Maria", "Amna", "Mahnoor",
    "Alina", "Hafsa", "Iqra", "Khadija", "Laiba", "Mariam", "Nida", "Rabia",
    "Sadia", "Urooj", "Warda", "Yasmeen", "Amina", "Bushra", "Daniya", "Eman",
    "Farah", "Ghazala", "Huma", "Javeria", "Kinza", "Lubna", "Mehwish", "Nadia",
  ],
  family: [
    "Khan", "Malik", "Sheikh", "Butt", "Chaudhry", "Qureshi", "Mirza", "Syed",
    "Raza", "Hussain", "Abbasi", "Ansari", "Hashmi", "Javed", "Lodhi", "Nawaz",
    "Rashid", "Shah", "Tariq", "Yousaf", "Akhtar", "Baig", "Dar", "Gill",
    "Iqbal", "Khokhar", "Memon", "Niazi", "Pirzada", "Siddiqui", "Wattoo", "Zafar",
  ],
};

const BENGALI: NamePool = {
  maleGiven: [
    "Abdul", "Rahman", "Karim", "Hasan", "Rahim", "Jamal", "Nasir", "Salam",
    "Arif", "Imran", "Kabir", "Mahmud", "Nurul", "Omar", "Rafiq", "Shafiq",
    "Tanvir", "Uddin", "Zahid", "Anis", "Faruk", "Habib", "Iqbal", "Jalal",
    "Kamal", "Liton", "Mizan", "Noman", "Parvez", "Quader", "Rashid", "Sajid",
  ],
  femaleGiven: [
    "Fatima", "Ayesha", "Nusrat", "Sharmin", "Tasnim", "Ruma", "Shila", "Mitu",
    "Nasreen", "Parvin", "Rokeya", "Salma", "Tahmina", "Urmi", "Zakia", "Anika",
    "Bristi", "Champa", "Dipa", "Esha", "Farzana", "Gulshan", "Hena", "Ishrat",
    "Jahanara", "Kohinoor", "Laila", "Maya", "Nargis", "Orin", "Popy", "Rina",
  ],
  family: [
    "Rahman", "Ahmed", "Hossain", "Islam", "Ali", "Khan", "Chowdhury", "Akter",
    "Begum", "Uddin", "Miah", "Sarkar", "Das", "Biswas", "Mandal", "Roy",
    "Saha", "Ghosh", "Banerjee", "Mitra", "Talukder", "Bhuiyan", "Khatun", "Parvin",
    "Sultana", "Karim", "Hasan", "Haque", "Kabir", "Malik", "Sheikh", "Chowdhury",
  ],
};

const MALAY: NamePool = {
  maleGiven: [
    "Ahmad", "Muhammad", "Hafiz", "Amir", "Hakim", "Faiz", "Azman", "Rizal",
    "Syafiq", "Irfan", "Danish", "Haziq", "Luqman", "Zulkifli", "Ismail", "Rashid",
    "Kamal", "Azmi", "Firdaus", "Haris", "Imran", "Jamil", "Khairul", "Latif",
    "Mikhail", "Nabil", "Osman", "Qayyum", "Roslan", "Shahrul", "Taufik", "Zainal",
  ],
  femaleGiven: [
    "Siti", "Nurul", "Aisyah", "Farah", "Nadia", "Syafiqah", "Aina", "Balqis",
    "Damia", "Erin", "Fatin", "Hana", "Insyirah", "Jasmine", "Keisha", "Liyana",
    "Mira", "Nabila", "Qistina", "Raihan", "Safiya", "Tasha", "Ummi", "Wani",
    "Yasmin", "Zara", "Amira", "Batrisyia", "Chinta", "Dahlia", "Emilia", "Filzah",
  ],
  family: [
    "Abdullah", "Rahman", "Hassan", "Ismail", "Yusof", "Ahmad", "Mohamed", "Ali",
    "Ibrahim", "Othman", "Salleh", "Hamid", "Karim", "Latif", "Majid", "Nasir",
    "Razak", "Saad", "Tahir", "Wan", "Zainal", "Bakar", "Cheong", "Lim",
    "Tan", "Lee", "Ng", "Goh", "Chua", "Teo", "Wong", "Koh",
  ],
};

const NORDIC: NamePool = {
  maleGiven: [
    "Erik", "Lars", "Anders", "Johan", "Magnus", "Olaf", "Sven", "Henrik",
    "Bjorn", "Gunnar", "Leif", "Nils", "Per", "Stefan", "Thomas", "Ulf",
    "Axel", "Emil", "Filip", "Gustav", "Hugo", "Isak", "Lucas", "Noah",
    "Oscar", "Viktor", "William", "Adam", "Felix", "Leo", "Max", "Theo",
  ],
  femaleGiven: [
    "Anna", "Ingrid", "Astrid", "Sigrid", "Helena", "Karin", "Eva", "Maria",
    "Sofia", "Elsa", "Freja", "Linnea", "Maja", "Nora", "Saga", "Wilma",
    "Alma", "Ebba", "Hedda", "Ida", "Klara", "Liv", "Signe", "Tilda",
    "Vera", "Agnes", "Elin", "Frida", "Greta", "Hanna", "Josefin", "Lotta",
  ],
  family: [
    "Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson",
    "Svensson", "Gustafsson", "Pettersson", "Jonsson", "Jansson", "Hansson", "Bengtsson", "Magnusson",
    "Hansen", "Nielsen", "Pedersen", "Andersen", "Christensen", "Larsen", "Olsen", "Rasmussen",
    "Johansen", "Kristensen", "Madsen", "Poulsen", "Thomsen", "Knudsen", "Mortensen", "Holm",
  ],
};

const POLISH: NamePool = {
  maleGiven: [
    "Jan", "Piotr", "Krzysztof", "Andrzej", "Tomasz", "Pawel", "Marcin", "Michal",
    "Jakub", "Mateusz", "Lukasz", "Adam", "Grzegorz", "Wojciech", "Marek", "Rafal",
    "Dariusz", "Henryk", "Jacek", "Kamil", "Leszek", "Maciej", "Norbert", "Oskar",
    "Przemyslaw", "Robert", "Sebastian", "Slawomir", "Tadeusz", "Witold", "Zbigniew", "Zygmunt",
  ],
  femaleGiven: [
    "Anna", "Maria", "Katarzyna", "Malgorzata", "Agnieszka", "Barbara", "Ewa", "Joanna",
    "Magdalena", "Aleksandra", "Natalia", "Karolina", "Monika", "Justyna", "Patrycja", "Sylwia",
    "Beata", "Dorota", "Elzbieta", "Grazyna", "Halina", "Irena", "Jolanta", "Krystyna",
    "Lucyna", "Renata", "Teresa", "Urszula", "Wanda", "Zofia", "Alina", "Danuta",
  ],
  family: [
    "Nowak", "Kowalski", "Wisniewski", "Wojcik", "Kowalczyk", "Kaminski", "Lewandowski", "Zielinski",
    "Szymanski", "Wozniak", "Dabrowski", "Kozlowski", "Jankowski", "Mazur", "Kwiatkowski", "Krawczyk",
    "Piotrowski", "Grabowski", "Nowakowski", "Pawlowski", "Michalski", "Król", "Wieczorek", "Jablonski",
    "Wróbel", "Malinowski", "Adamczyk", "Dudek", "Zawadzki", "Sikora", "Baran", "Rutkowski",
  ],
};

const NAME_POOLS: Record<AthleteNameCulture, NamePool> = {
  english_american: ENGLISH_AMERICAN,
  english_british: ENGLISH_BRITISH,
  english_oceania: ENGLISH_BRITISH,
  spanish: SPANISH,
  portuguese: PORTUGUESE,
  french: FRENCH,
  french_african: FRENCH,
  german: GERMAN,
  italian: ITALIAN,
  dutch: GERMAN,
  nordic: NORDIC,
  slavic: SLAVIC,
  ukrainian: SLAVIC,
  polish: POLISH,
  czech: SLAVIC,
  hungarian: SLAVIC,
  greek: ITALIAN,
  turkish: TURKISH,
  arabic: ARABIC,
  persian: PERSIAN,
  hebrew: HEBREW,
  chinese: CHINESE,
  japanese: JAPANESE,
  korean: KOREAN,
  hindi: HINDI,
  pakistani: PAKISTANI,
  bengali: BENGALI,
  thai: THAI,
  vietnamese: VIETNAMESE,
  indonesian: INDONESIAN,
  filipino: FILIPINO,
  malay: MALAY,
  swahili: SWAHILI,
  yoruba: YORUBA,
  amharic: ARABIC,
  south_african: SOUTH_AFRICAN,
  romanian: ITALIAN,
};

const CULTURE_COUNTRIES: Record<AthleteNameCulture, readonly string[]> = {
  japanese: ["Japan"],
  chinese: ["China", "Taiwan", "Hong Kong", "Macau", "Mongolia"],
  korean: ["South Korea", "North Korea"],
  hindi: ["India", "Nepal", "Sri Lanka", "Bhutan", "Maldives"],
  pakistani: ["Pakistan"],
  bengali: ["Bangladesh"],
  thai: ["Thailand", "Cambodia", "Laos", "Myanmar"],
  vietnamese: ["Vietnam"],
  indonesian: ["Indonesia"],
  filipino: ["Philippines"],
  malay: ["Malaysia", "Brunei", "Singapore"],
  arabic: [
    "Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman",
    "Egypt", "Morocco", "Algeria", "Tunisia", "Libya", "Jordan", "Lebanon", "Iraq",
    "Syria", "Yemen", "Palestine", "Mauritania", "Sudan", "Western Sahara", "Somalia",
  ],
  persian: ["Iran", "Afghanistan", "Tajikistan"],
  hebrew: ["Israel"],
  turkish: ["Turkey", "Azerbaijan", "Turkmenistan", "Uzbekistan", "Kyrgyzstan", "Kazakhstan"],
  spanish: [
    "Spain", "Mexico", "Argentina", "Colombia", "Chile", "Peru", "Venezuela", "Ecuador",
    "Guatemala", "Cuba", "Bolivia", "Dominican Republic", "Honduras", "Paraguay",
    "El Salvador", "Nicaragua", "Costa Rica", "Panama", "Uruguay", "Equatorial Guinea",
    "Andorra",
  ],
  portuguese: [
    "Brazil", "Portugal", "Angola", "Mozambique", "Cabo Verde", "Guinea-Bissau",
    "São Tomé and Príncipe", "Timor-Leste", "Macau",
  ],
  french: [
    "France", "Belgium", "Luxembourg", "Monaco", "Switzerland", "Haiti",
    "Mauritius", "Seychelles",
  ],
  french_african: [
    "Senegal", "Ivory Coast", "Democratic Republic of the Congo", "Congo", "Cameroon",
    "Benin", "Burkina Faso", "Niger", "Mali", "Togo", "Gabon", "Madagascar", "Chad",
    "Central African Republic", "Burundi", "Rwanda", "Djibouti", "Comoros", "Guinea",
  ],
  german: ["Germany", "Austria", "Liechtenstein"],
  italian: ["Italy", "San Marino", "Vatican City", "Malta"],
  dutch: ["Netherlands", "Suriname"],
  nordic: ["Sweden", "Norway", "Denmark", "Finland", "Iceland", "Estonia", "Latvia", "Lithuania"],
  slavic: ["Russia", "Belarus", "Armenia", "Georgia"],
  ukrainian: ["Ukraine"],
  polish: ["Poland"],
  czech: ["Czech Republic", "Slovakia"],
  hungarian: ["Hungary"],
  greek: ["Greece", "Cyprus"],
  romanian: ["Romania", "Moldova", "Montenegro", "Serbia", "Bosnia and Herzegovina", "North Macedonia", "Bulgaria", "Albania", "Kosovo", "Croatia", "Slovenia"],
  swahili: ["Kenya", "Tanzania", "Uganda", "South Sudan"],
  yoruba: ["Nigeria", "Ghana"],
  amharic: ["Ethiopia", "Eritrea"],
  south_african: ["South Africa", "Namibia", "Botswana", "Zimbabwe", "Zambia", "Lesotho", "Eswatini", "Malawi"],
  english_british: [
    "United Kingdom", "Ireland", "Jamaica", "Trinidad and Tobago", "Barbados",
    "Bahamas", "Grenada", "Saint Lucia", "Saint Vincent and the Grenadines",
    "Saint Kitts and Nevis", "Antigua and Barbuda", "Belize", "Guyana",
    "Gambia", "Sierra Leone", "Dominica",
  ],
  english_oceania: [
    "Australia", "New Zealand", "Fiji", "Papua New Guinea", "Samoa", "Tonga",
    "Solomon Islands", "Vanuatu", "Kiribati", "Tuvalu", "Nauru", "Marshall Islands",
    "Micronesia", "Palau",
  ],
  english_american: [
    "United States", "Canada", "Liberia",
  ],
};

const COUNTRY_NAME_TO_CULTURE = buildCountryCultureMap(CULTURE_COUNTRIES);

export function listUnmappedAthleteNameCountries(
  countries: readonly { name: string }[],
): string[] {
  return countries
    .filter((country) => !COUNTRY_NAME_TO_CULTURE.has(normalizeCountryName(country.name)))
    .map((country) => country.name);
}

function buildCountryCultureMap(
  cultureCountries: Record<AthleteNameCulture, readonly string[]>,
): Map<string, AthleteNameCulture> {
  const map = new Map<string, AthleteNameCulture>();

  for (const [culture, countries] of Object.entries(cultureCountries) as Array<
    [AthleteNameCulture, readonly string[]]
  >) {
    for (const country of countries) {
      map.set(normalizeCountryName(country), culture);
    }
  }

  return map;
}

function normalizeCountryName(countryName: string): string {
  return countryName.trim().toLowerCase();
}

export function resolveAthleteNameCulture(countryName: string): AthleteNameCulture {
  const culture = COUNTRY_NAME_TO_CULTURE.get(normalizeCountryName(countryName));
  if (!culture) {
    throw new Error(`No athlete name culture mapped for country: ${countryName}`);
  }
  return culture;
}

function getNamePool(culture: AthleteNameCulture): NamePool {
  return NAME_POOLS[culture];
}

export function athleteGivenName(
  gender: AthleteGender,
  index: number,
  culture: AthleteNameCulture,
): string {
  const pool = getNamePool(culture);
  const names = gender === "male" ? pool.maleGiven : pool.femaleGiven;
  return names[index % names.length]!;
}

export function athleteFamilyName(
  index: number,
  culture: AthleteNameCulture,
): string {
  const pool = getNamePool(culture);
  return pool.family[index % pool.family.length]!;
}

export function athleteNameCultureUsesPool(
  culture: AthleteNameCulture,
  givenName: string,
): boolean {
  const pool = getNamePool(culture);
  return (
    pool.maleGiven.includes(givenName) ||
    pool.femaleGiven.includes(givenName) ||
    pool.family.includes(givenName)
  );
}