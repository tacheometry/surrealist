import classes from "./style.module.scss";
import clsx from "clsx";
import { surrealql } from "codemirror-surrealql";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { ActionIcon, Box, CopyButton, Paper, PaperProps, Text } from "@mantine/core";
import { ReactNode, useEffect, useRef } from "react";
import { useIsLight } from "~/hooks/theme";
import { colorTheme } from "~/util/editor/extensions";
import { Icon } from "../Icon";
import { iconCheck, iconCopy } from "~/util/icons";

interface EditorRef {
	editor: EditorView;
	config: Compartment;
}

export interface CodePreviewProps extends PaperProps {
	value: string;
	title?: string;
	withCopy?: boolean;
	extensions?: Extension;
	rightSection?: ReactNode;
}

export function CodePreview({
	value,
	title,
	withCopy,
	extensions,
	rightSection,
	className,
	...rest
}: CodePreviewProps) {
	const isLight = useIsLight();
	const editorRef = useRef<EditorRef>();
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const config = new Compartment();
		const configExt = config.of(extensions || surrealql());

		const initialState = EditorState.create({
			doc: value,
			extensions: [
				configExt,
				colorTheme(),
				EditorState.readOnly.of(true),
				EditorView.lineWrapping,
			]
		});

		const editor = new EditorView({
			state: initialState,
			parent: ref.current!
		});

		editorRef.current = {
			editor,
			config
		};

		return () => {
			editor.destroy();
		};
	}, []);

	useEffect(() => {
		const { editor } = editorRef.current!;

		if (value == editor.state.doc.toString()) {
			return;
		}

		const transaction = editor.state.update({
			changes: {
				from: 0,
				to: editor.state.doc.length,
				insert: value
			}
		});

		editor.dispatch(transaction);
	}, [value]);

	useEffect(() => {
		const { editor, config } = editorRef.current!;

		editor.dispatch({
			effects: config.reconfigure(extensions || surrealql())
		});
	}, [extensions]);

	return (
		<>
			{title && (
				<Text
					ff="mono"
					tt="uppercase"
					fw={600}
					mb="sm"
					c="bright"
				>
					{title}
				</Text>
			)}
			<Paper
				p="xs"
				ref={ref}
				pos="relative"
				bg={isLight ? 'slate.1' : 'slate.9'}
				className={clsx(classes.root, className)}
				fz="lg"
				{...rest}
			>
				{withCopy ? (
					<CopyButton value={value}>
						{({ copied, copy }) => (
							<ActionIcon
								variant={copied ? 'gradient' : undefined}
								pos="absolute"
								top={6}
								right={6}
								onClick={copy}
								style={{ zIndex: 1 }}
								aria-label="Copy code to clipboard"
							>
								<Icon path={copied ? iconCheck : iconCopy} />
							</ActionIcon>
						)}
					</CopyButton>
				) : rightSection && (
					<Box
						pos="absolute"
						top={6}
						right={6}
						style={{ zIndex: 1 }}
					>
						{rightSection}
					</Box>
				)}
			</Paper>
		</>
	);
}
