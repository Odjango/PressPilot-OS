import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { addFilter } from '@wordpress/hooks';
import {
	ToggleControl,
	Panel,
	PanelBody,
	PanelRow,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const HeaderSettings = ( props ) => {
	let SWTStickyHeader;
	let SWTTransparentHeader;

	if ( props.hasOwnProperty( 'setAttributes' ) ) {
		SWTStickyHeader =
			props?.attributes?.SWTStickyHeader &&
			props.attributes.SWTStickyHeader
				? true
				: false;
		SWTTransparentHeader =
			props?.attributes?.SWTTransparentHeader &&
			props.attributes.SWTTransparentHeader
				? true
				: false;
	} else {
		SWTStickyHeader =
			props?.meta._swt_meta_sticky_header &&
			props.meta._swt_meta_sticky_header
				? true
				: false;
		SWTTransparentHeader =
			props?.meta._swt_meta_transparent_header &&
			props.meta._swt_meta_transparent_header
				? true
				: false;
	}

	return (
		<>
			{ ! SWTTransparentHeader && (
				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Sticky Header', 'spectra-one' ) }
						help={
							SWTStickyHeader
								? __(
									'Transparent header option will be disabled on enabling this option.',
									'spectra-one'
								  )
								: ''
						}
						checked={ SWTStickyHeader }
						onChange={ ( val ) => {
							return props.hasOwnProperty( 'setAttributes' )
								? props.setAttributes( {
									SWTStickyHeader: ! SWTStickyHeader,
								  } )
								: props.setMetaFieldValue(
									val,
									'_swt_meta_sticky_header'
								  );
						} }
					/>
				</PanelRow>
			) }
			{ ! SWTStickyHeader && (
				<PanelRow>
					<ToggleControl
						label={ __( 'Enable Transparent Header', 'spectra-one' ) }
						help={
							SWTTransparentHeader
								? __(
									'Sticky header option will be disabled on enabling this option.',
									'spectra-one'
								  )
								: ''
						}
						checked={ SWTTransparentHeader }
						onChange={ ( val ) => {
							return props.hasOwnProperty( 'setAttributes' )
								? props.setAttributes( {
									SWTTransparentHeader:
											! SWTTransparentHeader,
								  } )
								: props.setMetaFieldValue(
									val,
									'_swt_meta_transparent_header'
								  );
						} }
					/>
				</PanelRow>
			) }
		</>
	);
};

const Header = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { attributes, name } = props;

		if (
			attributes?.tagName &&
			'header' === attributes.tagName &&
			'core/template-part' === name
		) {
			return (
				<>
					<BlockEdit { ...props } />
					<InspectorControls>
						<Panel>
							<PanelBody
								title="Header Settings"
								initialOpen={ true }
							>
								<HeaderSettings { ...props } />
							</PanelBody>
						</Panel>
					</InspectorControls>
				</>
			);
		}
		return (
			<>
				<BlockEdit { ...props } />
			</>
		);
	};
}, 'Header' );

addFilter( 'editor.BlockEdit', 'swt/header', Header );

function HeaderAttributes( settings ) {
	const includeBlock = [ 'core/template-part' ];

	if ( includeBlock.includes( settings.name ) ) {
		if ( settings.attributes ) {
			settings.attributes = Object.assign( settings.attributes, {
				SWTStickyHeader: {
					type: 'boolean',
					default: false,
				},
				SWTTransparentHeader: {
					type: 'boolean',
					default: false,
				},
			} );
		}
	}

	return settings;
}

addFilter(
	'blocks.registerBlockType',
	'swt/header-attributes',
	HeaderAttributes
);

const HeaderCss = createHigherOrderComponent( ( BlockListBlock ) => {
	return ( props ) => {
		const { name, attributes } = props;

		const includeBlock = [ 'core/template-part' ];

		if ( includeBlock.includes( name ) ) {
			const { SWTTransparentHeader } = attributes;

			const transparentHeaderCss = `
				.block-editor-block-list__block.swt-transparent-header {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					z-index: 999;
					margin-top: 0;
				}

				.swt-transparent-header > .has-background {
					background: transparent !important;
				}
			`;

			return (
				<>
					{ SWTTransparentHeader && <style>{ transparentHeaderCss }</style> }
					<BlockListBlock { ...props } className={ `${ props?.className ? `${ props.className } ` : '' }${ SWTTransparentHeader ? 'swt-transparent-header ' : '' }` } />
				</>

			);
		}

		return (
			<>
				<BlockListBlock { ...props } />
			</>
		);
	};
}, 'HeaderCss' );

addFilter(
	'editor.BlockListBlock',
	'swt/header-css',
	HeaderCss
);
