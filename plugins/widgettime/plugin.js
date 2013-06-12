/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

'use strict';

CKEDITOR.plugins.add( 'widgettime', {
	requires: 'widget,dialog',
	icons: 'widgettime',

	init: function( editor ) {
		editor.widgets.add( 'time', {
			inline: true,
			dialog: 'widgettime',
			button: 'Time',
			template: '<time datetime="{dateTime}">{text}</time>',

			defaults: function() {
				return {
					dateTime: ( new Date() )[ Date.prototype.toISOString ? 'toISOString' : 'toUTCString' ](),
					text: ( new Date() ).toDateString()
				};
			},

			init: function() {
				this.setData( {
					dateTime: this.element.getAttribute( 'datetime' ),
					text: this.element.getText()
				} );
			},

			data: function() {
				this.element.setAttribute( 'datetime', this.data.dateTime );
				this.element.setText( this.data.text );
			},

			// Upcast all time elements.
			upcast: function( el ) {
				return el.name == 'time';
			}
		} );

		CKEDITOR.dialog.add( 'widgettime', this.path + 'dialogs/widgettime.js' );
	}
} );