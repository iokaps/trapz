import { config } from '@/config';
import { cn } from '@/utils/cn';
import React from 'react';
import Markdown from 'react-markdown';

interface Props {
	className?: string;
}

/**
 * View to display the game lobby information before the game starts
 * This example is **optional** and can be removed if not needed
 */
export const GameLobbyView: React.FC<React.PropsWithChildren<Props>> = ({
	className
}) => {
	return (
		<div
			className={cn(
				'animate-slide-up w-full max-w-screen-sm rounded-xl border-2 border-white/50 bg-white/90 shadow-lg backdrop-blur-sm',
				className
			)}
		>
			<div className="prose prose-sm prose-headings:bg-gradient-to-r prose-headings:from-purple-600 prose-headings:to-indigo-600 prose-headings:bg-clip-text prose-headings:text-transparent p-4">
				<Markdown>{config.gameLobbyMd}</Markdown>
			</div>
		</div>
	);
};
