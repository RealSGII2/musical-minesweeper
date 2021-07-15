import React, {
	Component,
	DetailedHTMLProps,
	HTMLAttributes,
	ReactNode,
	useEffect,
	useState,
} from 'react';
import '../styles/app.scss';

// Minicomponents
function Button({
	children,
	pressed,
	flagged,
	id,
	...rest
}: { children: ReactNode; pressed: boolean, flagged: boolean } & DetailedHTMLProps<
	HTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
>) {
	return (
		<td className={`${flagged ? 'flagged' : ''}`}>
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
// const numColorsMap: any = {
// 	x: null,
// 	0: 'lightgrey',
// 	1: 'blue',
// 	2: 'green',
// 	3: 'red',
// 	4: 'purple',
// 	5: 'maroon',
// 	6: 'turquoise',
// 	7: 'black',
// 	8: 'grey',
// };

/// OLD
// const numCharMap: any = {
// 	x: null,
// 	0: '',
// 	1: '𝅝',
// 	2: '𝅗𝅥',
// 	3: '♩',
// 	4: '♪',
// 	5: '𝅘𝅥𝅯',
// 	6: '𝅘𝅥𝅰',
// 	7: '𝅘𝅥𝅱',
// 	8: '𝅘𝅥𝅲',
// }

const numCharMap: any = {
	x: null,
	0: '',
	1: <img alt="1" src="/icons/whole.png" />,
	2: <img alt="2" src="/icons/half.png" />,
	3: <img alt="3" src="/icons/quarter.png" />,
	4: <img alt="4" src="/icons/eighth.png" />,
	5: <img alt="5" src="/icons/sixteenth.png" />,
	6: <img alt="6" src="/icons/thirty_second.png" />,
	7: <img alt="7" src="/icons/sixty_fourth.png" />,
	8: <img alt="8" src="/icons/one_twenty_eighth.png" />,
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

export const generateEmptyField = (
	width: number,
	height: number
) => generateFieldOf(width, height, -1);

export const generateSolvedField = (
	width: number,
	height: number,
	numMines: number,
	excludeX: number,
	excludeY: number
) => {
	let field: any = generateFieldOf(width, height, 0);
	// add mines
	while (numMines > 0) {
		const x = Math.floor(Math.random() * width);
		const y = Math.floor(Math.random() * height);
		// As it's small ints, might have duplicates, thus checking
		if (
			field[y][x] === 'x' ||
			(
				(excludeX - 1 <= x && x <= excludeX + 1) &&
				(excludeY - 1 <= y && y <= excludeY + 1)
			)
		) continue;
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
		generateEmptyField(props.width, props.height)
	);
	let [revealedGrid, setRevealedGrid] = useState(
		generateFieldOf(props.width, props.height, 0)
	);
	let [numRevealedTiles, setNumRevealedTiles] = useState(0);
	let [numFlags, setNumFlags] = useState(0);
	let [hasStarted, setStarted] = useState(false);
	
	let [clickCoords, setClickCoords] = useState<any[]>([null, null]);

	const [openCongrats, setOpenCongrats] = React.useState(false);
	const [openGameOver, setOpenGameOver] = React.useState(false);

	const { Congrats, GameOver, onStart, onEnd, onReset } = props;

	useEffect(() => {
		if (clickCoords[0] != null && clickCoords[1] != null) {
			updateTileState(clickCoords[1], clickCoords[0])
		}
	}, [grid])

	if (grid.length !== props.height) {
		if (clickCoords[0] == null && clickCoords[1] == null)
			setGrid(
				generateEmptyField(props.width, props.height)
			);
		else
			setGrid(
				generateSolvedField(props.width, props.height, props.numMines, clickCoords[0] ?? 0, clickCoords[1] ?? 0)
			);
	}

	if (revealedGrid.length !== props.height) {
		setRevealedGrid(
			generateFieldOf(props.width, props.height, 0)
		);
	}

	React.useImperativeHandle(ref, () => ({
		newGame() {
			setClickCoords([null, null])
			setNumFlags(0);
			props.setFlagsCount(0);
			setNumRevealedTiles(0);
			setGrid([
				...generateEmptyField(
					props.width,
					props.height,
				),
			]);
			setRevealedGrid([...generateFieldOf(props.width, props.height, 0)]);

			setOpenCongrats(false)
			setOpenGameOver(false)

			onReset(0, false);
			setStarted(false);
		},
		restartGame() {
			setClickCoords([null, null])
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
				revealedGrid[i - 1]?.[j - 1] !== 1
			) {
				revealedGrid[i - 1][j - 1] = 1;
				grid[i - 1]?.[j - 1] === 0 &&
					adjacentCellsToReveal.push([i - 1, j - 1]);
			}
			// reveal top
			if (grid[i - 1]?.[j] >= 0 && revealedGrid[i - 1]?.[j] !== 1) {
				revealedGrid[i - 1][j] = 1;
				grid[i - 1]?.[j] === 0 &&
					adjacentCellsToReveal.push([i - 1, j]);
			}
			// reveal top right
			if (
				grid[i - 1]?.[j + 1] >= 0 &&
				revealedGrid[i - 1]?.[j + 1] !== 1
			) {
				revealedGrid[i - 1][j + 1] = 1;
				grid[i - 1]?.[j + 1] === 0 &&
					adjacentCellsToReveal.push([i - 1, j + 1]);
			}
			// reveal right
			if (grid[i]?.[j + 1] >= 0 && revealedGrid[i]?.[j + 1] !== 1) {
				revealedGrid[i][j + 1] = 1;
				grid[i]?.[j + 1] === 0 &&
					adjacentCellsToReveal.push([i, j + 1]);
			}
			// reveal bottom right
			if (
				grid[i + 1]?.[j + 1] >= 0 &&
				revealedGrid[i + 1]?.[j + 1] !== 1
			) {
				revealedGrid[i + 1][j + 1] = 1;
				grid[i + 1]?.[j + 1] === 0 &&
					adjacentCellsToReveal.push([i + 1, j + 1]);
			}
			// reveal bottom
			if (grid[i + 1]?.[j] >= 0 && revealedGrid[i + 1]?.[j] !== 1) {
				revealedGrid[i + 1][j] = 1;
				grid[i + 1]?.[j] === 0 &&
					adjacentCellsToReveal.push([i + 1, j]);
			}
			// reveal bottom left
			if (
				grid[i + 1]?.[j - 1] >= 0 &&
				revealedGrid[i + 1]?.[j - 1] !== 1
			) {
				revealedGrid[i + 1][j - 1] = 1;
				grid[i + 1]?.[j - 1] === 0 &&
					adjacentCellsToReveal.push([i + 1, j - 1]);
			}
			// reveal left
			if (grid[i]?.[j - 1] >= 0 && revealedGrid[i]?.[j - 1] !== 1) {
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
					flagged={revealedGrid[i][j] === 2}
					onClick={() => {
						if (revealedGrid[i][j] === 2) return;
						
						if (!hasStarted) {
							setStarted(true);

							setClickCoords([null, null]);
							setClickCoords([j, i]);

							setGrid([
								...generateSolvedField(props.width, props.height, props.numMines, j, i)
							])

							onStart();
						}
						else
							updateTileState(i, j);
					}}
					onContextMenu={(event) => { onStart(); toggleFlag(i, j); (event.target as HTMLElement).blur(); event.preventDefault(); }}
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
