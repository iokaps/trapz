import * as React from 'react';

interface MixedLettersTrapProps {
	text: string;
}

export const MixedLettersTrap: React.FC<MixedLettersTrapProps> = ({ text }) => {
	const mixedText = React.useMemo(() => {
		// Shuffle letters while keeping first and last
		if (text.length <= 3) return text;

		const words = text.split(' ');
		const mixedWords = words.map((word) => {
			if (word.length <= 3) return word;

			const first = word[0];
			const last = word[word.length - 1];
			const middle = word.slice(1, -1).split('');

			// Shuffle middle letters
			for (let i = middle.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[middle[i], middle[j]] = [middle[j], middle[i]];
			}

			return first + middle.join('') + last;
		});

		return mixedWords.join(' ');
	}, [text]);

	return <>{mixedText}</>;
};
