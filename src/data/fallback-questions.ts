import type { Answer } from '@/types/game';

/**
 * Raw fallback question data
 * Used when AI generation is slow or fails
 */
interface RawQuestion {
	text: string;
	correctAnswerId: string;
	answers: Answer[];
}

export const fallbackQuestions: Record<string, RawQuestion[]> = {
	History: [
		{
			text: 'In what year did World War II end?',
			correctAnswerId: 'a',
			answers: [
				{ id: 'a', text: '1945' },
				{ id: 'b', text: '1943' },
				{ id: 'c', text: '1946' },
				{ id: 'd', text: '1944' }
			]
		},
		{
			text: 'Who was the first President of the United States?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Thomas Jefferson' },
				{ id: 'b', text: 'George Washington' },
				{ id: 'c', text: 'John Adams' },
				{ id: 'd', text: 'Benjamin Franklin' }
			]
		},
		{
			text: 'Which ancient wonder of the world still stands today?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: 'Colossus of Rhodes' },
				{ id: 'b', text: 'Hanging Gardens' },
				{ id: 'c', text: 'Great Pyramid of Giza' },
				{ id: 'd', text: 'Lighthouse of Alexandria' }
			]
		},
		{
			text: 'What year did the Berlin Wall fall?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: '1987' },
				{ id: 'b', text: '1991' },
				{ id: 'c', text: '1989' },
				{ id: 'd', text: '1985' }
			]
		},
		{
			text: 'Who painted the Mona Lisa?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Michelangelo' },
				{ id: 'b', text: 'Leonardo da Vinci' },
				{ id: 'c', text: 'Raphael' },
				{ id: 'd', text: 'Donatello' }
			]
		}
	],
	Science: [
		{
			text: 'What is the chemical symbol for gold?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Go' },
				{ id: 'b', text: 'Au' },
				{ id: 'c', text: 'Gd' },
				{ id: 'd', text: 'Ag' }
			]
		},
		{
			text: 'How many planets are in our solar system?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: '7' },
				{ id: 'b', text: '9' },
				{ id: 'c', text: '8' },
				{ id: 'd', text: '10' }
			]
		},
		{
			text: 'What is the speed of light in vacuum?',
			correctAnswerId: 'a',
			answers: [
				{ id: 'a', text: '299,792 km/s' },
				{ id: 'b', text: '150,000 km/s' },
				{ id: 'c', text: '400,000 km/s' },
				{ id: 'd', text: '200,000 km/s' }
			]
		},
		{
			text: 'What is the largest organ in the human body?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: 'Liver' },
				{ id: 'b', text: 'Brain' },
				{ id: 'c', text: 'Skin' },
				{ id: 'd', text: 'Heart' }
			]
		},
		{
			text: 'What gas do plants absorb from the atmosphere?',
			correctAnswerId: 'd',
			answers: [
				{ id: 'a', text: 'Oxygen' },
				{ id: 'b', text: 'Nitrogen' },
				{ id: 'c', text: 'Hydrogen' },
				{ id: 'd', text: 'Carbon dioxide' }
			]
		}
	],
	Geography: [
		{
			text: 'What is the capital of France?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'London' },
				{ id: 'b', text: 'Paris' },
				{ id: 'c', text: 'Berlin' },
				{ id: 'd', text: 'Madrid' }
			]
		},
		{
			text: 'Which ocean is the largest?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: 'Atlantic Ocean' },
				{ id: 'b', text: 'Indian Ocean' },
				{ id: 'c', text: 'Pacific Ocean' },
				{ id: 'd', text: 'Arctic Ocean' }
			]
		},
		{
			text: 'What is the longest river in the world?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Amazon River' },
				{ id: 'b', text: 'Nile River' },
				{ id: 'c', text: 'Mississippi River' },
				{ id: 'd', text: 'Yangtze River' }
			]
		},
		{
			text: 'How many continents are there?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: '5' },
				{ id: 'b', text: '6' },
				{ id: 'c', text: '7' },
				{ id: 'd', text: '8' }
			]
		},
		{
			text: 'What is the smallest country in the world?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Monaco' },
				{ id: 'b', text: 'Vatican City' },
				{ id: 'c', text: 'San Marino' },
				{ id: 'd', text: 'Liechtenstein' }
			]
		}
	],
	Sports: [
		{
			text: 'How many players are on a soccer team?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: '9' },
				{ id: 'b', text: '10' },
				{ id: 'c', text: '11' },
				{ id: 'd', text: '12' }
			]
		},
		{
			text: 'What sport is known as "the beautiful game"?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Basketball' },
				{ id: 'b', text: 'Soccer' },
				{ id: 'c', text: 'Tennis' },
				{ id: 'd', text: 'Baseball' }
			]
		},
		{
			text: 'How many points is a touchdown worth in American football?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: '5' },
				{ id: 'b', text: '6' },
				{ id: 'c', text: '7' },
				{ id: 'd', text: '8' }
			]
		},
		{
			text: 'What is the diameter of a basketball hoop in inches?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: '16' },
				{ id: 'b', text: '18' },
				{ id: 'c', text: '20' },
				{ id: 'd', text: '22' }
			]
		},
		{
			text: 'Which country won the first FIFA World Cup?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: 'Brazil' },
				{ id: 'b', text: 'Argentina' },
				{ id: 'c', text: 'Uruguay' },
				{ id: 'd', text: 'Italy' }
			]
		}
	],
	Movies: [
		{
			text: 'Who directed the movie "Titanic"?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Steven Spielberg' },
				{ id: 'b', text: 'James Cameron' },
				{ id: 'c', text: 'Christopher Nolan' },
				{ id: 'd', text: 'Martin Scorsese' }
			]
		},
		{
			text: 'What year was the first Star Wars movie released?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: '1975' },
				{ id: 'b', text: '1977' },
				{ id: 'c', text: '1979' },
				{ id: 'd', text: '1980' }
			]
		},
		{
			text: 'Which movie won the most Oscars?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Avatar' },
				{ id: 'b', text: 'Titanic' },
				{ id: 'c', text: 'The Godfather' },
				{ id: 'd', text: 'Gone with the Wind' }
			]
		},
		{
			text: 'Who played Iron Man in the Marvel movies?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: 'Chris Evans' },
				{ id: 'b', text: 'Chris Hemsworth' },
				{ id: 'c', text: 'Robert Downey Jr.' },
				{ id: 'd', text: 'Mark Ruffalo' }
			]
		},
		{
			text: 'What is the highest-grossing film of all time?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: 'Avengers: Endgame' },
				{ id: 'b', text: 'Titanic' },
				{ id: 'c', text: 'Avatar' },
				{ id: 'd', text: 'Star Wars' }
			]
		}
	],
	Music: [
		{
			text: 'Who is known as the "King of Pop"?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Elvis Presley' },
				{ id: 'b', text: 'Michael Jackson' },
				{ id: 'c', text: 'Prince' },
				{ id: 'd', text: 'Freddie Mercury' }
			]
		},
		{
			text: 'Which band released "Bohemian Rhapsody"?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: 'The Beatles' },
				{ id: 'b', text: 'Led Zeppelin' },
				{ id: 'c', text: 'Queen' },
				{ id: 'd', text: 'Pink Floyd' }
			]
		},
		{
			text: 'How many strings does a standard guitar have?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: '4' },
				{ id: 'b', text: '5' },
				{ id: 'c', text: '6' },
				{ id: 'd', text: '7' }
			]
		},
		{
			text: 'Who composed the "Four Seasons"?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: 'Mozart' },
				{ id: 'b', text: 'Beethoven' },
				{ id: 'c', text: 'Antonio Vivaldi' },
				{ id: 'd', text: 'Bach' }
			]
		},
		{
			text: 'What instrument did Miles Davis play?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Saxophone' },
				{ id: 'b', text: 'Trumpet' },
				{ id: 'c', text: 'Piano' },
				{ id: 'd', text: 'Drums' }
			]
		}
	],
	Literature: [
		{
			text: 'Who wrote "Romeo and Juliet"?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Charles Dickens' },
				{ id: 'b', text: 'William Shakespeare' },
				{ id: 'c', text: 'Jane Austen' },
				{ id: 'd', text: 'Mark Twain' }
			]
		},
		{
			text: 'What is the first book in the Harry Potter series?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Chamber of Secrets' },
				{ id: 'b', text: "Philosopher's Stone" },
				{ id: 'c', text: 'Prisoner of Azkaban' },
				{ id: 'd', text: 'Goblet of Fire' }
			]
		},
		{
			text: 'Who wrote "1984"?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: 'Aldous Huxley' },
				{ id: 'b', text: 'Ray Bradbury' },
				{ id: 'c', text: 'George Orwell' },
				{ id: 'd', text: 'H.G. Wells' }
			]
		},
		{
			text: 'What is the longest novel ever written?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'War and Peace' },
				{ id: 'b', text: 'In Search of Lost Time' },
				{ id: 'c', text: 'Don Quixote' },
				{ id: 'd', text: 'Les Misérables' }
			]
		},
		{
			text: 'Who wrote "The Great Gatsby"?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Ernest Hemingway' },
				{ id: 'b', text: 'F. Scott Fitzgerald' },
				{ id: 'c', text: 'John Steinbeck' },
				{ id: 'd', text: 'William Faulkner' }
			]
		}
	],
	'Pop Culture': [
		{
			text: 'What social media platform has a bird as its logo?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: 'Facebook' },
				{ id: 'b', text: 'Instagram' },
				{ id: 'c', text: 'Twitter/X' },
				{ id: 'd', text: 'TikTok' }
			]
		},
		{
			text: 'Which streaming service created "Stranger Things"?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Hulu' },
				{ id: 'b', text: 'Netflix' },
				{ id: 'c', text: 'Disney+' },
				{ id: 'd', text: 'Prime Video' }
			]
		},
		{
			text: 'Who is the most followed person on Instagram?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: 'Kylie Jenner' },
				{ id: 'b', text: 'Cristiano Ronaldo' },
				{ id: 'c', text: 'Selena Gomez' },
				{ id: 'd', text: 'Dwayne Johnson' }
			]
		},
		{
			text: 'What year did YouTube launch?',
			correctAnswerId: 'b',
			answers: [
				{ id: 'a', text: '2003' },
				{ id: 'b', text: '2005' },
				{ id: 'c', text: '2007' },
				{ id: 'd', text: '2009' }
			]
		},
		{
			text: 'Which video game franchise features Mario?',
			correctAnswerId: 'c',
			answers: [
				{ id: 'a', text: 'Sony' },
				{ id: 'b', text: 'Microsoft' },
				{ id: 'c', text: 'Nintendo' },
				{ id: 'd', text: 'Sega' }
			]
		}
	]
};
