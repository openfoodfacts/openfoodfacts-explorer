/**
 * Command type definition for the command palette
 * Commands are decoupled from UI and can be extended easily
 */
export type CommandCategory = 'Navigation' | 'Product' | 'Utility' | 'Miscellaneous';

export type Command = {
	id: string;
	title: string;
	description?: string;
	keywords?: string[];
	shortcut?: string[];
	category?: CommandCategory;
	contextual?: boolean;
	priority?: number;
	action: () => void | Promise<void>;
};

export type CommandActionContext = {
	notify?: {
		success: (message: string) => void;
		error: (message: string) => void;
		info: (message: string) => void;
	};
};

/**
 * Product context for contextual commands
 */
export interface ProductContext extends CommandActionContext {
	barcode?: string;
	productName?: string;
	currentPath?: string;
}

/**
 * Command provider function type
 * Providers can accept context (like current route, product, etc.)
 * and return a list of commands
 */
export type CommandProvider<T = CommandActionContext> = (context?: T) => Command[];
