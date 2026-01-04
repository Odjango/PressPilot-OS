import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';

const latestPostList = createHigherOrderComponent( ( BlockListBlock ) => {
	return ( props ) => {
		const { name, attributes } = props;

		if ( name !== 'core/latest-posts' ) {
			return <BlockListBlock { ...props } />;
		}

		const { displayFeaturedImage } = attributes;

		return <BlockListBlock { ...props } className={ `${ props?.className ? `${ props.className } ` : '' }${ displayFeaturedImage ? 'swt-has-featured-image ' : '' }` } />;
	};
}, 'latestPostList' );

addFilter(
	'editor.BlockListBlock',
	'swt/latest-post-list',
	latestPostList
);
