/**
 * Computes the 1-based page number to navigate to when changing page size,
 * preserving the first item currently visible (clamped to valid pages).
 */
export function getPageForNewPageSize(
	currentPage: number,
	currentPageSize: number,
	newPageSize: number,
	totalCount: number
): number {
	if (newPageSize <= 0 || totalCount <= 0) {
		return 1;
	}

	const safeCurrentPage = Math.max(1, currentPage);
	const safeCurrentPageSize = Math.max(1, currentPageSize);
	const firstItemIndex = (safeCurrentPage - 1) * safeCurrentPageSize;
	const targetPage = Math.floor(firstItemIndex / newPageSize) + 1;
	const totalPages = Math.max(1, Math.ceil(totalCount / newPageSize));

	return Math.min(targetPage, totalPages);
}
