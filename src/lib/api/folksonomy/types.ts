export type FolksonomyTag = {
	product: string;
	k: string;
	v: string;

	owner?: string;
	version?: number;
	editor?: string;
	last_edit?: string;
	comment?: string;
};

export type FolksonomyKey = {
	k: string;
	count: number;
	values: number;
};
