export type CropData = {
	x: number;
	y: number;
	width: number;
	height: number;
	rotate: number;
	scaleX: number;
	scaleY: number;
};

export type ImageEditData = {
	cropData: CropData;
	rotationAngle: number;
};
