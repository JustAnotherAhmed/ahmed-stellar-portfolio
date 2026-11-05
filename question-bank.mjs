/** Offline, curated general knowledge bank. Every question has four distinct options. */
export const QUESTION_BANK=Object.freeze({
  Easy:[
    ['e01','Geography','What is the capital of Japan?',['Tokyo','Osaka','Kyoto','Seoul'],'Tokyo','Tokyo is the capital of Japan.'],
    ['e02','Space','Which planet is known as the Red Planet?',['Mars','Venus','Jupiter','Mercury'],'Mars','Iron oxide in the surface material gives Mars its reddish appearance.'],
    ['e03','Nature','What do honeybees collect from flowers to make honey?',['Nectar','Sand','Salt','Bark'],'Nectar','Bees turn nectar into honey.'],
    ['e04','Literature','Who wrote Romeo and Juliet?',['William Shakespeare','Jane Austen','Charles Dickens','Homer'],'William Shakespeare','Shakespeare wrote the tragedy in the late 16th century.'],
    ['e05','Science','What is H₂O commonly called?',['Water','Oxygen','Hydrogen','Salt'],'Water','H₂O is the chemical formula for water.'],
    ['e06','Arts','Which instrument usually has 88 keys?',['Piano','Violin','Trumpet','Flute'],'Piano','A standard modern piano has 88 keys.'],
    ['e07','History','The pyramids at Giza are in which country?',['Egypt','Greece','Peru','India'],'Egypt','The Giza pyramid complex is near Cairo, Egypt.'],
    ['e08','Technology','What does URL stand for?',['Uniform Resource Locator','Universal Routing Language','User Registry Link','Unified Response Layer'],'Uniform Resource Locator','A URL identifies the location of a web resource.'],
    ['e09','Sports','How many players are on the field for one soccer team at the start of a standard match?',['11','7','9','15'],'11','Association football starts with 11 players per team.'],
    ['e10','Music','How many strings does a standard violin have?',['4','5','6','8'],'4','A standard violin has four strings.'],
    ['e11','Animals','Which animal is a mammal?',['Dolphin','Shark','Trout','Octopus'],'Dolphin','Dolphins breathe air and nurse their young.'],
    ['e12','Geography','Which ocean is the largest by area?',['Pacific Ocean','Atlantic Ocean','Indian Ocean','Arctic Ocean'],'Pacific Ocean','The Pacific is Earth’s largest ocean.'],
    ['e13','Science','What gas do plants release during photosynthesis?',['Oxygen','Nitrogen','Helium','Methane'],'Oxygen','Oxygen is released when water is split in photosynthesis.'],
    ['e14','Food','Which grain is commonly used to make traditional risotto?',['Rice','Wheat','Barley','Corn'],'Rice','Risotto is a classic Italian rice dish.'],
    ['e15','Computing','What does CPU stand for?',['Central Processing Unit','Computer Power Utility','Control Program Upload','Core Peripheral Unit'],'Central Processing Unit','The CPU executes instructions in a computer.']
  ],
  Medium:[
    ['m01','Astronomy','Which planet has the shortest orbital period around the Sun?',['Mercury','Earth','Neptune','Mars'],'Mercury','Mercury completes an orbit in about 88 Earth days.'],
    ['m02','Geography','Which strait connects the Mediterranean Sea to the Atlantic Ocean?',['Strait of Gibraltar','Bering Strait','Strait of Malacca','Bosphorus'],'Strait of Gibraltar','The Strait of Gibraltar links the Mediterranean and Atlantic.'],
    ['m03','Biology','Which organelle performs most photosynthesis in plant cells?',['Chloroplast','Nucleus','Mitochondrion','Ribosome'],'Chloroplast','Chloroplasts contain the pigments and machinery for photosynthesis.'],
    ['m04','History','In which century did the French Revolution begin?',['18th','16th','17th','19th'],'18th','The French Revolution began in 1789.'],
    ['m05','Technology','Which protocol typically secures browser traffic using TLS?',['HTTPS','FTP','SMTP','Telnet'],'HTTPS','HTTPS uses TLS to protect HTTP connections.'],
    ['m06','Language','What is a palindrome?',['A word or phrase that reads the same backward','A word borrowed from another language','A word with opposite meaning','A word used only in poetry'],'A word or phrase that reads the same backward','“Level” is an example of a palindrome.'],
    ['m07','Chemistry','What is the atomic number of carbon?',['6','8','12','14'],'6','Carbon has six protons in its nucleus.'],
    ['m08','Art','Which artist painted The Starry Night?',['Vincent van Gogh','Pablo Picasso','Claude Monet','Salvador Dalí'],'Vincent van Gogh','Van Gogh painted The Starry Night in 1889.'],
    ['m09','Math','What is the square root of 144?',['12','10','14','16'],'12','Twelve multiplied by twelve equals 144.'],
    ['m10','Earth science','Which scale describes earthquake magnitude today in most scientific reports?',['Moment magnitude scale','Beaufort scale','Mohs scale','Fujita scale'],'Moment magnitude scale','Moment magnitude (Mw) is commonly used for earthquake size.'],
    ['m11','Literature','Who wrote the novel Frankenstein?',['Mary Shelley','Emily Brontë','Virginia Woolf','George Eliot'],'Mary Shelley','Mary Shelley published Frankenstein in 1818.'],
    ['m12','Science','Which electromagnetic waves have shorter wavelengths than visible violet light?',['Ultraviolet','Infrared','Radio','Microwave'],'Ultraviolet','Ultraviolet lies just beyond violet in the electromagnetic spectrum.'],
    ['m13','Geography','What is the longest river entirely within South America?',['Amazon River','Danube River','Nile River','Mekong River'],'Amazon River','The Amazon river system flows through northern South America.'],
    ['m14','Computing','In binary, what is decimal 10?',['1010','1001','1100','1111'],'1010','Binary 1010 is 8 + 2 = 10.'],
    ['m15','Physics','What is the SI unit of electrical resistance?',['Ohm','Watt','Volt','Ampere'],'Ohm','Resistance is measured in ohms (Ω).']
  ],
  Hard:[
    ['h01','Physics','What particle carries the electromagnetic force in quantum electrodynamics?',['Photon','Gluon','Neutrino','Higgs boson'],'Photon','Photons are the gauge bosons of the electromagnetic interaction.'],
    ['h02','Astronomy','Which moon has a dense nitrogen-rich atmosphere?',['Titan','Europa','Io','Phobos'],'Titan','Titan, a moon of Saturn, has a thick nitrogen-dominated atmosphere.'],
    ['h03','Mathematics','What is the derivative of ln(x) for x > 0?',['1/x','x','ln(x)','eˣ'],'1/x','The derivative of the natural logarithm is 1/x.'],
    ['h04','History','Which 1648 treaties helped end the Thirty Years’ War?',['Peace of Westphalia','Treaty of Tordesillas','Treaty of Versailles','Treaty of Utrecht'],'Peace of Westphalia','The Peace of Westphalia refers to treaties signed in 1648.'],
    ['h05','Biology','In DNA, which base pairs with guanine?',['Cytosine','Adenine','Thymine','Uracil'],'Cytosine','Guanine pairs with cytosine through three hydrogen bonds.'],
    ['h06','Computing','What is the worst-case time complexity of binary search on a sorted array?',['O(log n)','O(n)','O(n log n)','O(1)'],'O(log n)','Binary search halves the remaining search interval at each step.'],
    ['h07','Earth science','Which boundary separates Earth’s crust from the mantle?',['Mohorovičić discontinuity','Gutenberg discontinuity','Lehmann discontinuity','Kármán line'],'Mohorovičić discontinuity','The Moho marks a major seismic boundary between crust and mantle.'],
    ['h08','Chemistry','Which element has the symbol W?',['Tungsten','Tantalum','Tin','Tellurium'],'Tungsten','W derives from tungsten’s historical name, wolfram.'],
    ['h09','Philosophy','Which philosopher wrote Critique of Pure Reason?',['Immanuel Kant','David Hume','René Descartes','John Locke'],'Immanuel Kant','Kant published Critique of Pure Reason in 1781.'],
    ['h10','Astronomy','What is the approximate limit above which a non-rotating white dwarf cannot remain stable?',['1.4 solar masses','0.1 solar masses','10 solar masses','50 solar masses'],'1.4 solar masses','The Chandrasekhar limit is about 1.4 times the Sun’s mass.'],
    ['h11','Geography','Which sea lies between the Arabian Peninsula and northeastern Africa?',['Red Sea','Black Sea','Caspian Sea','Baltic Sea'],'Red Sea','The Red Sea separates the Arabian Peninsula from northeastern Africa.'],
    ['h12','Statistics','Which theorem explains why means of many independent identically distributed variables often approach a normal distribution?',['Central limit theorem','Bayes’ theorem','Pythagorean theorem','Noether’s theorem'],'Central limit theorem','The central limit theorem describes the approximate distribution of sample means.'],
    ['h13','Music','What does “fugue” describe in Western classical music?',['A contrapuntal composition built around a subject','A four-line poem','An unaccompanied solo drum piece','An orchestral tuning method'],'A contrapuntal composition built around a subject','Fugues develop a recurring musical subject in multiple voices.'],
    ['h14','Ecology','Which process converts atmospheric nitrogen into biologically usable forms?',['Nitrogen fixation','Transpiration','Nitrification only','Fermentation'],'Nitrogen fixation','Nitrogen fixation converts N₂ into ammonia or related usable nitrogen compounds.'],
    ['h15','Computer science','Which traversal of a binary search tree yields sorted keys?',['In-order','Pre-order','Post-order','Breadth-first'],'In-order','In-order traversal visits left subtree, node, then right subtree.']
  ]
});
export const DIFFICULTIES=Object.freeze(['Easy','Medium','Hard']);
export const QUESTIONS=Object.freeze(Object.fromEntries(Object.entries(QUESTION_BANK).map(([level,rows])=>[level,Object.freeze(rows.map(([id,topic,question,options,correct,explanation])=>Object.freeze({id,level,topic,question,options:Object.freeze(options),correct,explanation})))])));
