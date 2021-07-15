import React, {
	Component,
	DetailedHTMLProps,
	HTMLAttributes,
	ReactNode,
	useState,
} from 'react';
import '../styles/app.scss';

// Minicomponents
function Button({
	children,
	pressed,
	id,
	...rest
}: { children: ReactNode; pressed: boolean } & DetailedHTMLProps<
	HTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
>) {
	return (
		<td>
			<button
				className={`gridButton ${pressed ? 'pressed' : ''}`}
				id={id}
				{...rest}
			>
				{children}
			</button>
		</td>
	);
}

// Actual grid
const numColorsMap: any = {
	x: null,
	0: 'lightgrey',
	1: 'blue',
	2: 'green',
	3: 'red',
	4: 'purple',
	5: 'maroon',
	6: 'turquoise',
	7: 'black',
	8: 'grey',
};

const numCharMap: any = {
	x: null,
	0: '',
	1: '𝅝',
	2: '𝅗𝅥',
	3: '♩',
	4: '♪',
	5: '𝅘𝅥𝅯',
	6: '𝅘𝅥𝅰',
	7: '𝅘𝅥𝅱',
	8: '𝅘𝅥𝅲',
}

const generateFieldOf = (width: number, height: number, value: number) => {
	let field: any = [];
	for (let i = 0; i < height; i++) {
		field[i] = [];
		for (let j = 0; j < width; j++) {
			field[i][j] = value;
		}
	}

	return [...field];
};

export const generateSolvedField = (
	width: number,
	height: number,
	numMines: number
) => {
	let field: any = generateFieldOf(width, height, 0);
	// add mines
	while (numMines > 0) {
		const x = Math.floor(Math.random() * width);
		const y = Math.floor(Math.random() * height);
		// As it's small ints, might have duplicates, thus checking
		if (field[y][x] === 'x') continue;
		field[y][x] = 'x';
		numMines -= 1;
	}
	// populate numbers
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			if (field[i][j] === 'x') {
				// increment top left
				if (typeof field[i - 1]?.[j - 1] === 'number')
					field[i - 1][j - 1]++;
				// increment top
				if (typeof field[i - 1]?.[j] === 'number') field[i - 1][j]++;
				// increment top right
				if (typeof field[i - 1]?.[j + 1] === 'number')
					field[i - 1][j + 1]++;
				// increment right
				if (typeof field[i]?.[j + 1] === 'number') field[i][j + 1]++;
				// increment bottom right
				if (typeof field[i + 1]?.[j + 1] === 'number')
					field[i + 1][j + 1]++;
				// increment bottom
				if (typeof field[i + 1]?.[j] === 'number') field[i + 1][j]++;
				// increment bottom left
				if (typeof field[i + 1]?.[j - 1] === 'number')
					field[i + 1][j - 1]++;
				// increment left
				if (typeof field[i]?.[j - 1] === 'number') field[i][j - 1]++;
			}
		}
	}
	return [...field];
};

const MineGrid = React.forwardRef((props: any, ref) => {
	let [grid, setGrid] = useState(
		generateSolvedField(props.width, props.height, props.numMines)
	);
	let [revealedGrid, setRevealedGrid] = useState(
		generateFieldOf(props.width, props.height, 0)
	);
	let [numRevealedTiles, setNumRevealedTiles] = useState(0);
	let [numFlags, setNumFlags] = useState(0);
	let [hasStarted, setStarted] = useState(false);

	const [openCongrats, setOpenCongrats] = React.useState(false);
	const [openGameOver, setOpenGameOver] = React.useState(false);

	const { Congrats, GameOver, onStart, onEnd, onReset } = props;

	if (grid.length !== props.height) {
		setGrid(
			generateSolvedField(props.width, props.height, props.numMines)
		);
	}

	if (revealedGrid.length !== props.height) {
		setRevealedGrid(
			generateFieldOf(props.width, props.height, 0)
		);
	}

	React.useImperativeHandle(ref, () => ({
		newGame() {
			setNumFlags(0);
			props.setFlagsCount(0);
			setNumRevealedTiles(0);
			setGrid([
				...generateSolvedField(
					props.width,
					props.height,
					props.numMines
				),
			]);
			setRevealedGrid([...generateFieldOf(props.width, props.height, 0)]);

			setOpenCongrats(false)
			setOpenGameOver(false)

			onReset(0, false);
			setStarted(false);
		},
		restartGame() {
			setNumFlags(0);
			props.setFlagsCount(0);
			setNumRevealedTiles(0);
			setRevealedGrid([...generateFieldOf(props.width, props.height, 0)]);
			setStarted(false);
		},
		solveGame() {
			setNumFlags(0);
			props.setFlagsCount(0);
			setNumRevealedTiles(0);
			setRevealedGrid([...generateFieldOf(props.width, props.height, 1)]);
			setStarted(false);
		},
	}));

	const gameOver = () => {
		setOpenGameOver(true);
		setRevealedGrid([...generateFieldOf(props.width, props.height, 1)]);
		onEnd();
	};

	const winGame = () => {
		setOpenCongrats(true);
		setRevealedGrid([...generateFieldOf(props.width, props.height, 1)]);
		onEnd();
	};

	const updateTileState = (i: number, j: number) => {
		if (revealedGrid[i][j] === 1) {
			return;
		}
		if (grid[i][j] === 0) {
			revealNeighbourZeros(i, j);
		}
		if (grid[i][j] === 'x') {
			gameOver();
			return;
		}
		revealedGrid[i][j] = 1;
		let numRevealedTiles = 0;
		for (let i = 0; i < revealedGrid.length; i++) {
			for (let j = 0; j < revealedGrid[i].length; j++) {
				if (revealedGrid[i][j] === 1) {
					numRevealedTiles += 1;
				}
			}
		}
		setNumRevealedTiles(numRevealedTiles);
		setRevealedGrid([...revealedGrid]);
		numRevealedTiles === props.width * props.height - props.numMines &&
			winGame();
	};

	const toggleFlag = (i: number, j: number) => {
		if (revealedGrid[i][j] === 0) {
			revealedGrid[i][j] = 2;
			setNumFlags(++numFlags);
		} else if (revealedGrid[i][j] === 2) {
			revealedGrid[i][j] = 0;
			setNumFlags(--numFlags);
		}

		props.setFlagsCount(numFlags);
		setRevealedGrid([...revealedGrid]);
	};

	const revealNeighbourZeros = (x: number, y: number) => {
		let adjacentCellsToReveal = [[x, y]];
		revealedGrid[x][y] = 1;
		while (adjacentCellsToReveal.length > 0) {
			let [i, j] = adjacentCellsToReveal[0];
			// reveal top left
			if (
				grid[i - 1]?.[j - 1] >= 0 &&
				revealedGrid[i - 1]?.[j - 1] === 0
			) {
				revealedGrid[i - 1][j - 1] = 1;
				grid[i - 1]?.[j - 1] === 0 &&
					adjacentCellsToReveal.push([i - 1, j - 1]);
			}
			// reveal top
			if (grid[i - 1]?.[j] >= 0 && revealedGrid[i - 1]?.[j] === 0) {
				revealedGrid[i - 1][j] = 1;
				grid[i - 1]?.[j] === 0 &&
					adjacentCellsToReveal.push([i - 1, j]);
			}
			// reveal top right
			if (
				grid[i - 1]?.[j + 1] >= 0 &&
				revealedGrid[i - 1]?.[j + 1] === 0
			) {
				revealedGrid[i - 1][j + 1] = 1;
				grid[i - 1]?.[j + 1] === 0 &&
					adjacentCellsToReveal.push([i - 1, j + 1]);
			}
			// reveal right
			if (grid[i]?.[j + 1] >= 0 && revealedGrid[i]?.[j + 1] === 0) {
				revealedGrid[i][j + 1] = 1;
				grid[i]?.[j + 1] === 0 &&
					adjacentCellsToReveal.push([i, j + 1]);
			}
			// reveal bottom right
			if (
				grid[i + 1]?.[j + 1] >= 0 &&
				revealedGrid[i + 1]?.[j + 1] === 0
			) {
				revealedGrid[i + 1][j + 1] = 1;
				grid[i + 1]?.[j + 1] === 0 &&
					adjacentCellsToReveal.push([i + 1, j + 1]);
			}
			// reveal bottom
			if (grid[i + 1]?.[j] >= 0 && revealedGrid[i + 1]?.[j] === 0) {
				revealedGrid[i + 1][j] = 1;
				grid[i + 1]?.[j] === 0 &&
					adjacentCellsToReveal.push([i + 1, j]);
			}
			// reveal bottom left
			if (
				grid[i + 1]?.[j - 1] >= 0 &&
				revealedGrid[i + 1]?.[j - 1] === 0
			) {
				revealedGrid[i + 1][j - 1] = 1;
				grid[i + 1]?.[j - 1] === 0 &&
					adjacentCellsToReveal.push([i + 1, j - 1]);
			}
			// reveal left
			if (grid[i]?.[j - 1] >= 0 && revealedGrid[i]?.[j - 1] === 0) {
				revealedGrid[i][j - 1] = 1;
				grid[i]?.[j - 1] === 0 &&
					adjacentCellsToReveal.push([i, j - 1]);
			}
			adjacentCellsToReveal.shift();
		}
	};

	const renderTile = (i: number, j: number) => {
		if (revealedGrid[i][j] === 0) {
			// not opened
			return '';
		} else if (revealedGrid[i][j] === 1) {
			// opened
			if (typeof grid[i][j] === 'number') {
				return numCharMap[grid[i][j]];
			} else {
				return (
					<img
						src='https://twemoji.maxcdn.com/v/latest/svg/1f4a3.svg'
						alt='mine'
						width={20}
						height={20}
					/>
				);
			}
		} else if (revealedGrid[i][j] === 2) {
			// flagged
			return (
				<img
					src='https://twemoji.maxcdn.com/v/latest/svg/1f6a9.svg'
					alt='flag'
					width={20}
					height={20}
				/>
			);
		}
	};

	let buttons = [];
	for (let i = 0; i < grid.length; i++) {
		buttons[i] = new Array<any>();
		for (let j = 0; j < grid[i].length; j++) {
			buttons[i].push(
				<Button
					id={i + ':' + j}
					pressed={revealedGrid[i][j] === 1}
					style={{
						color:
							revealedGrid[i][j] === 0
								? 'lightgrey'
								: numColorsMap[grid[i][j]],
					}}
					onClick={() => {
						if (!hasStarted) {
							setStarted(true);
							onStart();
						}

						updateTileState(i, j);
					}}
					onContextMenu={(event) => { toggleFlag(i, j); event.preventDefault(); }}
				>
					{renderTile(i, j)}
				</Button>
			);
		}
	}

	return (
		<>
			<div className={`map ${props.width < 16 ? 'small' : ''}`}>
				{openCongrats && Congrats({ revealed: numRevealedTiles, close: () => setOpenCongrats(false) })}
				{openGameOver && GameOver({ revealed: numRevealedTiles, close: () => setOpenGameOver(false) })}
				<table>
					{buttons.map((b) => (
						<tr>{b}</tr>
					))}
				</table>
			</div>
		</>
	);
});

export default MineGrid;
