/**
 * The panels object is a dictionary of individual panel objects.
 * Each key of the dictionary is the id of the panel, and the value is the panel object.
 *
 * Apps typically display a number of root panels with known panel ids (e.g. health_card and environment_card).
 * Panels can reference other panels and display them as sub-panels.
 */
export type KnowledgePanels = { [key: string]: KnowledgePanel };

export type KnowledgePanel = {
	/**
	 * Type of the panel.
	 * If set to "card", the panel and its sub-panels should be displayed in a card. If set to "inline", the panel
	 * should have its content always displayed.
	 */
	type?: 'card' | 'inline';
	/**
	 * Whether the panel is expanded by default.
	 */
	expanded?: boolean;
	/**
	 * If set to "large", the content of the panel should be expanded on large screens, but it should still be possible
	 * to unexpand it.
	 */
	expand_for?: string;
	/**
	 * An evaluation status specifically for this title element.
	 * This can be used to directly color the icon if 'icon_color_from_evaluation' is true and this field is present, or
	 * it might provide context for the title itself. e.g. bad is red.
	 * Please be careful in choosing colors, to avoid 50 shades of red.
	 */
	evaluation?: 'good' | 'average' | 'neutral' | 'bad' | 'unknown';
	/**
	 * If true, suggests that this panel could be rendered as half-width on mobile devices, allowing for side-by-side
	 * display with another half-width panel if applicable.
	 */
	half_width_on_mobile?: boolean;
	title_element?: KnowledgeTitleElement;
	/**
	 * An ordered list of elements to display in the content of the panel.
	 */
	elements?: KnowledgeElement[];
	/**
	 * A message level, as levels we use in log.
	 * It might help theming the panel visually. Some possible values: info, recommendation
	 */
	level?: 'info' | 'recommendation';
	/**
	 * Size is either empty (normal display) or 'small' to indicate a panel that should have a smaller font size
	 */
	size?: 'small';
	/**
	 * Topics currently include health, environment, problem
	 */
	topics?: ('health' | 'environment' | 'problem')[];
};

type KnowledgeTitleElementBase = {
	/** A short name of this panel, not including any actual values */
	name?: string;
	title?: string;
	subtitle?: string;

	icon_url: string;
	/** If set to "small", the icon should be displayed at a small size. */
	icon_size?: string;
	icon_color_from_evaluation?: boolean;

	/**
	 * Used to indicate how the value of this item is measured, such as "grade" for Nutri-Score and Green-Score or
	 * "percentage" for Salt
	 */
	type?: never;
};

type KnowledgeTitleElementPercentage = KnowledgeTitleElementBase & {
	type: 'percentage';
	value: number;
};

type KnowledgeTitleElementGrade = KnowledgeTitleElementBase & {
	type: 'grade';
	/** The value for this panel where it corresponds to a A to E grade such as the Nutri-Score or the Green-Score. */
	grade: 'a' | 'b' | 'c' | 'd' | 'e' | 'unknown';
};

export type KnowledgeTitleElement =
	| KnowledgeTitleElementPercentage
	| KnowledgeTitleElementGrade
	| KnowledgeTitleElementBase;

type KnowledgeElementBase = {
	/**
	 * The type of the included element object.
	 * The type also indicates which field contains the included element object.
	 * e.g. if the type is "text", the included element object will be in the "text_element" field.
	 */
	element_type: string;
};

export type KnowledgeElementText = KnowledgeElementBase & {
	element_type: 'text';
	text_element: {
		type: 'summary' | 'warning' | 'notes';
		html: string;
		language: string;
		lc: string;
		edit_field_id: string;
		edit_field_type: string;
		edit_field_value: string;
		source_url: string;
		source_text: string;
		source_lc: string;
		source_language: string;
	};
};

export type KnowledgeElementImage = KnowledgeElementBase & {
	element_type: 'image';
	image_element: {
		url: string;
		width: number;
		height: number;
		alt_text: string;
	};
};

export type KnowledgeElementPanelGroup = KnowledgeElementBase & {
	element_type: 'panel_group';
	panel_group_element: {
		title: string;
		image?: KnowledgePanelImage;
		panel_ids: string[];
	};
};

export type KnowledgePanelImage = {
	alt: string;
	id: string;
	lc: string;
	sizes: Record<string, { height: number; width: number; url: string }>;
};

export type KnowledgeElementPanel = KnowledgeElementBase & {
	element_type: 'panel';
	panel_element: {
		panel_id: string;
	};
};

type TableRow = {
	values: { text: string; evaluation?: string }[];
};

type TableColumn = {
	type: string;
	text: string;
	text_for_small_screen: string;
	style: string;
	column_group_id: string;
	shown_by_default: boolean;
};

export type KnowledgeElementTable = KnowledgeElementBase & {
	element_type: 'table';
	table_element: {
		id: string;
		title: string;
		columns: TableColumn[];
		rows: TableRow[];
	};
};

export type KnowledgeElementAction = KnowledgeElementBase & {
	element_type: 'action';
	action_element: {
		actions: string[];
		html: string;
	};
};

type GeoPointer = {
	geo: { lat: number; lng: number };
};

export type KnowledgeElementMap = KnowledgeElementBase & {
	element_type: 'map';
	map_element: {
		pointers: GeoPointer[];
	};
};

export type KnowledgeElement =
	| KnowledgeElementText
	| KnowledgeElementImage
	| KnowledgeElementPanelGroup
	| KnowledgeElementPanel
	| KnowledgeElementTable
	| KnowledgeElementAction
	| KnowledgeElementMap;
