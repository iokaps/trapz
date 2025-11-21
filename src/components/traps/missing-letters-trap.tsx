import * as React from 'react';

interface MissingLettersTrapProps {
	text: string;
}

export const MissingLettersTrap: React.FC<MissingLettersTrapProps> = ({
	text
}) => {
	const maskedText = React.useMemo(() => {
		// Remove ~40% of letters (excluding spaces)
		const chars = text.split('');
		const masked = chars.map((char, index) => {
			if (char === ' ') return char;

			// Keep first and last character of each word visible
			const isFirstChar =
				index === 0 || (index > 0 && chars[index - 1] === ' ');
			const isLastChar =
				index === chars.length - 1 ||
				(index < chars.length - 1 && chars[index + 1] === ' ');

			if (isFirstChar || isLastChar) return char;

			// 40% chance to hide letter
			return Math.random() < 0.4 ? '_' : char;
		});

		return masked.join('');
	}, [text]);

	return <>{maskedText}</>;
};
