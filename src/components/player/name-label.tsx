import { config } from '@/config';
import * as React from 'react';

interface NameLabelProps {
	name: string;
}

/**
 * A label component to display the player's name
 * This example is **optional** and can be removed if not needed
 */
export const NameLabel: React.FC<NameLabelProps> = ({ name }) => {
	return (
		<div className="flex items-center gap-2 text-gray-800">
			<span className="font-medium">{config.playerNameLabel}</span>
			<span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-lg font-extrabold text-transparent">
				{name}
			</span>
		</div>
	);
};
