import { subscribe, dispatch, select } from '@wordpress/data';

window.addEventListener( 'load', function () {
	swtSiteTitle();
} );

function swtSiteTitle() {
	/* Do things after DOM has fully loaded */

	subscribe( function () {
		setTimeout( function () {
			const editorStylesWrapper = document.querySelector(
				'.editor-styles-wrapper'
			);

			if ( null !== editorStylesWrapper ) {
				const editorStylesWrapperWidth = parseInt(
					editorStylesWrapper.offsetWidth
				);
				if ( editorStylesWrapperWidth < 1350 ) {
					editorStylesWrapper.classList.remove(
						'swt-stacked-title-visibility'
					);
					editorStylesWrapper.classList.add(
						'swt-stacked-title-visibility'
					);
				} else {
					editorStylesWrapper.classList.remove(
						'swt-stacked-title-visibility'
					);
				}
			}

			// Title visibility with new editor compatibility update.
			const titleVisibility = document.querySelector( '.title-visibility' );
			const titleBlock = document.querySelector(
				'.edit-post-visual-editor__post-title-wrapper'
			);

			if ( null === titleVisibility && null !== titleBlock ) {
				let titleVisibilityTrigger = '';
				if ( select( 'core/editor' ).getEditedPostAttribute( 'meta' )
					?._swt_meta_site_title_display &&
					true ===
					select( 'core/editor' ).getEditedPostAttribute( 'meta' )
						._swt_meta_site_title_display
				) {
					titleVisibilityTrigger =
						'<span class="dashicons dashicons-hidden title-visibility" data-tooltip="Enable Title"></span>';
					titleBlock.classList.toggle( 'invisible' );
				} else {
					titleVisibilityTrigger =
						'<span class="dashicons dashicons-visibility title-visibility" data-tooltip="Disable Title"></span>';
				}

				titleBlock.insertAdjacentHTML(
					'beforeend',
					titleVisibilityTrigger
				);
				document
					.querySelector( '.title-visibility' )
					.addEventListener( 'click', function () {
						titleBlock.classList.toggle( 'invisible' );

						if ( this.classList.contains( 'dashicons-hidden' ) ) {
							this.classList.add( 'dashicons-visibility' );
							this.classList.remove( 'dashicons-hidden' );
							this.dataset.tooltip = 'Disable Title';
							dispatch( 'core/editor' ).editPost( {
								meta: {
									_swt_meta_site_title_display: false,
								},
							} );
						} else {
							this.classList.add( 'dashicons-hidden' );
							this.classList.remove( 'dashicons-visibility' );
							this.dataset.tooltip = 'Enable Title';
							dispatch( 'core/editor' ).editPost( {
								meta: {
									_swt_meta_site_title_display: true,
								},
							} );
						}
					} );
			}

			// Show post/page title wrapper outline & eye icon only when clicked.
			const titleInput = document.querySelector(
				'.editor-post-title__input'
			);
			const visibilityIcon = document.querySelector( '.title-visibility' );
			if ( null !== titleInput && null !== visibilityIcon ) {
				document.addEventListener( 'click', function ( event ) {
					if ( ! titleBlock.contains( event.target ) ) {
						visibilityIcon.classList.remove(
							'swt-show-visibility-icon'
						);
						titleInput.classList.remove(
							'swt-show-editor-title-outline'
						);
					}
				} );
				document.addEventListener( 'visibilitychange', function () {
					visibilityIcon.classList.remove( 'swt-show-visibility-icon' );
					titleInput.classList.remove(
						'swt-show-editor-title-outline'
					);
				} );
				titleBlock.addEventListener( 'focusout', function () {
					visibilityIcon.classList.remove( 'swt-show-visibility-icon' );
					titleInput.classList.remove(
						'swt-show-editor-title-outline'
					);
				} );
				titleBlock.addEventListener( 'click', function () {
					visibilityIcon.classList.add( 'swt-show-visibility-icon' );
					titleInput.classList.add( 'swt-show-editor-title-outline' );
				} );
				titleInput.addEventListener( 'input', function () {
					visibilityIcon.classList.add( 'swt-show-visibility-icon' );
					this.classList.add( 'swt-show-editor-title-outline' );
				} );
			}

			const responsivePreview = document.querySelectorAll(
				'.is-tablet-preview, .is-mobile-preview'
			);
			if ( responsivePreview.length ) {
				document.body.classList.add( 'responsive-enabled' );
			} else {
				document.body.classList.remove( 'responsive-enabled' );
			}
		}, 1 );
	} );
}
