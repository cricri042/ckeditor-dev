'use strict';

var CKCONSOLE = (function() {
	var	that = {
			container: null,
			definitions: {},

			add: function( consoleName, definition ) {
				this.definitions[ consoleName ] = definition;
				definition.name = consoleName;
			},

			create: function( consoleName, config ) {
				var editor = config.editor,
					definition = CKEDITOR.tools.prototypedCopy( this.definitions[ consoleName ] );

				if ( typeof editor == 'string' )
					editor = CKEDITOR.instances[ editor ];

				createConsole( editor, definition, config );
			},

			panels: {
				box: panelBox,
				log: panelLog
			}
		};

	function createConsole( editor, definition, config ) {
		var container = createContainer(),
			editorPanel = createEditorPanel( editor, container, definition, config ),
			panels = [],
			panelDefinition,
			panel;

		for ( var i = 0; i < definition.panels.length; ++i ) {
			panelDefinition = definition.panels[ i ];
			panel = new that.panels[ panelDefinition.type ]( editor, editorPanel, panelDefinition );

			if ( panel.refreshOn )
				setupPanelRefresh( editor, panel );

			panels.push( panel );
		}

		editor.on( 'focus', function() {
			editorPanel.addClass( 'ckconsole_active' );
		} );

		editor.on( 'blur', function() {
			editorPanel.removeClass( 'ckconsole_active' );
		} );
	}

	function createContainer() {
		var container = that.container;

		if ( !container ) {
			container = that.container = fromHtml( '<div class="ckconsole cke_reset_all"></div>' );
			CKEDITOR.document.getBody().append( container );

			var link = fromHtml( '<link rel="stylesheet" href="' + CKEDITOR.getUrl( 'dev/console/console.css' ) + '">' );
			CKEDITOR.document.getHead().append( link );
		}

		return container;
	}

	function createEditorPanel( editor, container, definition, config ) {
		var el = fromHtml( editorPanelTpl, {
			name: editor.name + '/' + definition.name
		} );

		el.findOne( '.ckconsole_header' ).on( 'click', function( evt ) {
			if ( el.hasClass( 'ckconsole_folded') )
				el.removeClass( 'ckconsole_folded' );
			else
				el.addClass( 'ckconsole_folded' );
		} );

		if ( config.folded )
			el.addClass( 'ckconsole_folded' );

		container.append( el );

		return el;
	}

	function createPanel( editorPanel, data ) {
		var el = fromHtml( panelTpl, data );

		el.findOne( '.ckconsole_header' ).on( 'click', function( evt ) {
			if ( el.hasClass( 'ckconsole_folded') )
				el.removeClass( 'ckconsole_folded' );
			else
				el.addClass( 'ckconsole_folded' );
		} );

		editorPanel.append( el );

		return el;
	}

	function fromHtml( html, data ) {
		if ( html instanceof CKEDITOR.template )
			html = html.output( data );

		return CKEDITOR.dom.element.createFromHtml( html );
	}

	function setupPanelRefresh( editor, panel ) {
		var timer,
			buffer = CKEDITOR.tools.eventsBuffer( 500, function() {
				panel.refresh();
				panel.container.addClass( 'ckconsole_refreshed' );

				if ( timer )
					clearTimeout( timer );
				setTimeout( removeClass, 200 );
			} );

		editor.on( 'pluginsLoaded', function() {
			panel.refreshOn( editor, buffer.input );
		} );

		function removeClass() {
			panel.container.removeClass( 'ckconsole_refreshed' );
		}
	}


	//
	// PANELS -----------------------------------------------------------------
	//

	function panelBox( editor, editorPanel, panelDefinition ) {
		var container = createPanel( editorPanel, {
			header: '<span class="ckconsole_value" data-value="header"></span>',
			content: '<div class="ckconsole_content">' + panelDefinition.content + '</div>'
		} );

		var valuesElements = container.find( '.ckconsole_value' ),
			values = {};

		for ( var el, i = 0, l = valuesElements.count(); i < l; ++i ) {
			el = valuesElements.getItem( i );
			values[ el.data( 'value' ) ] = el;
		}

		return {
			editor: editor,
			definition: panelDefinition,
			container: container,
			valuesElements: values,
			refreshOn: panelDefinition.refreshOn,
			refresh: function() {
				var values = this.definition.refresh( this.editor ),
					valueName;

				for ( valueName in values )
					this.valuesElements[ valueName ].setHtml( values[ valueName ] );
			}
		};
	}

	function panelLog( editor, editorPanel, panelDefinition ) {
		var container = createPanel( editorPanel, {
			header: 'Console',
			content: '<ul class="ckconsole_log"></ul>'
		} );

		var logList = container.findOne( '.ckconsole_log' );

		editor.on( 'pluginsLoaded', function() {
			panelDefinition.on( editor, log, logFn );
		} );

		// Scroll list to the end after it has been shrinked.
		editor.on( 'blur', function() {
			logList.$.scrollTop = logList.$.scrollHeight;
		}, null, null, 999 );

		function log( msg ) {
			var time = new Date().toString().match( /\d\d:\d\d:\d\d/ )[ 0 ],
				item = fromHtml( logItemTpl, { time: time, msg: msg } );

			logList.append( item );
			logList.$.scrollTop = logList.$.scrollHeight;

			setTimeout( function() {
				item.removeClass( 'ckconsole_fresh_log_item' );
			}, 250 );
		}

		function logFn( msg ) {
			return function() {
				log( msg );
			}
		}

		return {
			editor: editor,
			definition: panelDefinition,
			container: container
		};
	}

	var editorPanelTpl = new CKEDITOR.template(
			'<section class="ckconsole_editor_panel"><h1 class="ckconsole_header ckconsole_editor_header" onmousedown="return false">Editor: {name}</h1></section>'
		),
		panelTpl = new CKEDITOR.template(
			'<section class="ckconsole_panel ckconsole_folded">' +
				'<h1 class="ckconsole_header ckconsole_panel_header" onmousedown="return false">{header}</h1>' +
				'{content}' +
			'</section>'
		),
		logItemTpl = new CKEDITOR.template(
			'<li class="ckconsole_log_item ckconsole_fresh_log_item"><time datetime="{time}" class="ckconsole_time">{time}</time> <code>{msg}</code></li>'
		);

	return that;
})();