/**
 * Command categories used to group palette items.
 */
export type CommandCategory = 'Navigation' | 'Product' | 'Utility' | 'Miscellaneous';

/**
 * Represents a single command available in the command palette.
 */
export type Command = {
	/** Stable, unique kebab-case id for the command */
	id: string;
	/** Primary shown title for the command */
	title: string;
	/** Short description shown below the title */
	description: string;
	/** Extra keywords to improve fuzzy search recall */
	keywords?: string[];
	/** Visual grouping category for the command */
	category: CommandCategory;
	/** Higher numbers sort earlier within a category (default 0) */
	priority?: number;
	/** True for commands meaningful only on product pages */
	contextual?: boolean;
	/** Display-only shortcut hint like ['G','H'] */
	shortcut?: string[];
	/** True when the command requires a sub-input before execution. */
	requiresInput?: boolean;
	/** Placeholder text for sub-input mode when requiresInput is true. */
	inputPlaceholder?: string;
	/** Action executed when the command is chosen. May be sync or async. */
	action: (input?: string) => void | Promise<void>;
};
