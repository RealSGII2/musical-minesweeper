import CButton from './components/CButton';
import Grid from './components/MineGrid';
import './styles/app.scss';

import { Button } from '@rmwc/button';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogButton,
} from '@rmwc/dialog';
import { IconButton } from '@rmwc/icon-button';
import {
	List,
	ListItem,
	ListItemMeta,
	ListItemPrimaryText,
	ListItemSecondaryText,
	ListItemText,
} from '@rmwc/list';
import { Radio } from '@rmwc/radio';
import { Typography } from '@rmwc/typography';
import { SnackbarQueue } from '@rmwc/snackbar';
import '@rmwc/button/styles';
import '@rmwc/dialog/styles';
import '@rmwc/icon-button/styles';
import '@rmwc/list/styles';
import '@rmwc/radio/styles';
import '@rmwc/typography/styles';
import '@rmwc/snackbar/styles';

import snackbarQueue from './queues/snackbar';

import { forwardRef, useRef, useState } from 'react';
import MineGrid from './components/MineGrid';

import { useStopwatch } from 'react-timer-hook';
import React from 'react';

const difficulties = [
	{
		name: 'Beginner',
		rowCount: 9,
		colCount: 9,
		mineCount: 10,
	},
	{
		name: 'Intermediate',
		rowCount: 16,
		colCount: 16,
		mineCount: 40,
	},
	{
		name: 'Expert',
		rowCount: 16,
		colCount: 30,
		mineCount: 99,
	},
];

const App = forwardRef(
	(
		{
			rowCount,
			colCount,
			mineCount,
			openDifficultyDialog,
      openHelpDialog,
		}: { [index: string]: any },
		ref
	) => {
		// Actual state
		const [flagCount, setFlagCount] = useState(0);
		const grid = useRef<any>();

    // Rerender
    const [rerender, setRerender] = useState(0);

		// Timer
		const {
			seconds: _seconds,
			minutes: _minutes,
			hours: _hours,
			start,
			pause,
			reset,
		} = useStopwatch({});

		const seconds =
			_seconds.toString().length == 1 ? `0${_seconds}` : _seconds;
		const minutes =
			_minutes.toString().length == 1 ? `0${_minutes}` : _minutes;
		const hours = _hours.toString().length == 1 ? `0${_hours}` : _hours;

		const time = `${hours}:${minutes}:${seconds}`;

		// Functions
		React.useImperativeHandle(ref, () => ({
			newGame() {
				grid.current.newGame();
			},
      rerender() {
        setRerender(rerender + 1);
      }
		}));

		const Stats = ({ revealed }: any) => (
			<div className='flexRow'>
				<div>
					<Typography use='headline5'>{flagCount}</Typography>
					<Typography use='subtitle2'>Flags Placed</Typography>
				</div>
				<div className='divider' />
				<div>
					<Typography use='headline5'>{time}</Typography>
					<Typography use='subtitle2'>Time</Typography>
				</div>
				<div className='divider' />
				<div>
					<Typography use='headline5'>{revealed}</Typography>
					<Typography use='subtitle2'>Blocks revealed</Typography>
				</div>
			</div>
		);

		const newGameSnackbar = {
			body: "Click 'Start a new match' to make a new game",
			dismissesOnAction: true,
			actions: [
				{
					title: 'Dismiss',
				},
			],
			leading: true,
		};

		return (
			<>
				<SnackbarQueue messages={snackbarQueue.messages} />

				<div className='gameWrapper'>
					<div className='header'>
						<div>
							<img
								src='https://twemoji.maxcdn.com/v/latest/svg/1f6a9.svg'
								className='icon'
							/>

							<div>{mineCount - flagCount}</div>
						</div>

						<div className='divider'></div>

						<div>
							<img
								src='https://twemoji.maxcdn.com/v/latest/svg/1f550.svg'
								className='icon'
							/>

							<div>{time}</div>
						</div>

						<div className='spacer' />

						<IconButton
							icon='help_outline'
							label='Help & controls'
              onClick={openHelpDialog}
						/>
					</div>

					<MineGrid
						ref={grid}
						height={rowCount || 16}
						width={colCount || 30}
						numMines={mineCount || 99}
						setFlagsCount={() => {}}
						onStart={start}
						onEnd={pause}
						onReset={reset}
						GameOver={({ revealed, close }: any) => (
							<div className='banner error'>
								<Typography use='headline4'>
									Game Over
								</Typography>
								<Typography use='subtitle1'>
									You triggered a mine.
								</Typography>

								<Stats revealed={revealed} />

								<div className='buttonRow'>
									<Button
										label='Review last game'
										outlined
										onClick={() => {
											snackbarQueue.notify(
												newGameSnackbar
											);
											close();
										}}
									/>
									<Button
										label='Change difficulty'
										outlined
										onClick={openDifficultyDialog}
									/>
									<Button
										label='New game'
										unelevated
										onClick={grid?.current?.newGame}
									/>
								</div>
							</div>
						)}
						Congrats={({ revealed, close }: any) => (
							<div className='banner error'>
								<Typography use='headline4'>
									Game Completed!
								</Typography>
								<Typography use='subtitle1'>
									You got through the entire map without
									triggering a mine.
								</Typography>

								<Stats revealed={revealed} />

								<div className='buttonRow'>
									<Button
										label='Review last game'
										outlined
										onClick={() => {
											snackbarQueue.notify(
												newGameSnackbar
											);
											close();
										}}
									/>
									<Button
										label='Change difficulty'
										outlined
										onClick={openDifficultyDialog}
									/>
									<Button
										label='New game'
										unelevated
										onClick={grid?.current?.newGame}
									/>
								</div>
							</div>
						)}
					/>

					<div className='actionRow buttonRow'>
						<CButton onClick={grid?.current?.newGame}>
							<span className='material-icons'>refresh</span>
							<span>Start a new match</span>
						</CButton>

						<CButton onClick={openDifficultyDialog}>
							<span className='material-icons'>tune</span>
							<span>Change difficulty</span>
						</CButton>
					</div>
				</div>
			</>
		);
	}
);

function Container() {
	// Dialogs
	/* Difficulty */
	const [difficultyOpen, setDifficultyOpen] = useState(false);
	const [selectedDifficulty, setSelectedDifficulty] = useState(2);

  /* Help */
	const [helpOpen, setHelpOpen] = useState(false);

	// Configuration
	const [rowCount, setRowCount] = useState(16);
	const [colCount, setColCount] = useState(30);
	const [mineCount, setMineCount] = useState(99);

	// App ref
	const app = useRef<any>();

	return (
		<>
			<Dialog
				open={difficultyOpen}
				onClose={(evt) => {
					if (evt.detail.action == 'change') {
						const difficulty = difficulties[selectedDifficulty];

						setRowCount(difficulty.rowCount);
						setColCount(difficulty.colCount);
						setMineCount(difficulty.mineCount);

            app.current?.rerender();

						setTimeout(() => {
              app.current?.newGame();
            }, 50)
					}

					setDifficultyOpen(false);
				}}
			>
				<DialogTitle>Change Difficulty</DialogTitle>
				<DialogContent>
					<p>
						<b>Warning:</b> This will create a new game.
					</p>

					<List twoLine style={{ width: 480 }}>
						{difficulties.map((item, index) => (
							<ListItem
								key={index}
								onClick={() => setSelectedDifficulty(index)}
							>
								<ListItemText>
									<ListItemPrimaryText>
										{item.name}
									</ListItemPrimaryText>
									<ListItemSecondaryText>
										Rows: {item.rowCount} - Columns:{' '}
										{item.colCount} - Mines:{' '}
										{item.mineCount}
									</ListItemSecondaryText>
								</ListItemText>
								<ListItemMeta>
									<Radio
										checked={selectedDifficulty === index}
										readOnly
									/>
								</ListItemMeta>
							</ListItem>
						))}
					</List>
				</DialogContent>
				<DialogActions>
					<DialogButton action='close'>Cancel</DialogButton>
					<DialogButton action='change' unelevated>
						Change difficulty
					</DialogButton>
				</DialogActions>
			</Dialog>

      <Dialog
				open={helpOpen}
				onClose={(evt) => {
					setHelpOpen(false);
				}}
			>
				<DialogTitle>Info</DialogTitle>
				<DialogContent>
					<p style={{ marginBottom: 0 }}>
						Musical Minesweeper, v1.1.0 by RealSGII2.
					</p>
          <p style={{ marginTop: 0 }}>
            A skin of Minesweeper using musical notes.
          </p>

          <Typography use="headline5">
            Main Goal
          </Typography>
          <p>
            Clear the entire map except for blocks containing mines underneath them. Flagging is optional, but may be useful.
          </p>

          <Typography use="headline5">
            Controls
          </Typography>
          <p>
            <b>Left mouse button</b>: Reveal a block <br/>
            <b>Right mouse button</b>: Flag a block, again to unflag
          </p>

          <Typography use="headline6">
            Mobile
          </Typography>
          <p style={{ marginTop: 0 }}>
            <b>Tap</b>: Reveal a block <br/>
            <b>Long press</b>: Flag a block, again to unflag
          </p>

          <Typography use="headline5">
            Credits
          </Typography>
          <p>
            Flag, clock, and bomb emoji made by Twitter in the Twemoji project. This website uses <a href="https://material.io/" target="_blank">https://material.io/</a> standards.
          </p>
				</DialogContent>
				<DialogActions>
					<DialogButton action='close' isDefaultAction>Dismiss</DialogButton>
				</DialogActions>
			</Dialog>

			<App
				rowCount={rowCount}
				colCount={colCount}
				mineCount={mineCount}
				openDifficultyDialog={() => setDifficultyOpen(true)}
        openHelpDialog={() => setHelpOpen(true)}
				ref={app}
			/>
		</>
	);
}

export default Container;
