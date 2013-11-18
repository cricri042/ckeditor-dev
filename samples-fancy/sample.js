/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

// Tool scripts for the sample pages.
// This file can be ignored and is not required to make use of CKEditor.

(function() {
	'use strict';

	var navigationTpl =
		'<div id="navigation">' +
			'<ul>' +
				'<li><a target="_new" href="http://ckeditor.com">Project Homepage</a></li>' +
				'<li><a target="_new" href="http://dev.ckeditor.com/">I found a bug</a></li>' +
				'<li><a target="_new" href="http://github.com/ckeditor">Fork us on GitHub</a></li>' +
			'</ul>' +
		'</div>',

		categoryTpl = new CKEDITOR.template(
			'<dl>' +
				'<dt id="{id}">{name}</dt>' +
				'<dd>' +
					'<ul>{items}</ul>' +
				'</dd>' +
			'</dl>'
		),

		categoryItemTpl = new CKEDITOR.template(
			'<li><a href="{url}" class="{class}">{name} {badges}</a></li>'
		),

		categoryStructure = {
			'index.html': {
				name: 'Samples index'
			},

			'basic': {
				name: 'Basic samples',
				samples: {
					'replacebycode.html': 	'Replace by code',
					'replacebyclass.html': 	'Replace by class'
				}
			},

			'inline': {
				name: 'Inline editing',
				samples: {
					'inlineall.html': 		'Massive inline editing',
					'inlinebycode.html': 	'Inline editor by code',
					'inlinetextarea.html': {
						name: 				'Inline based on textarea',
						isNew: true
					}
				}
			},

			'advanced': {
				name: 'Advanced samples',
				samples: {
					'datafiltering.html': 	{
						name: 				'Data filtering (ACF)',
						isNew: true,
						isBeta: true
					},
					'index1.html': 			'Replace DIV on the fly',
					'index2.html': 			'Append instances',
					'index3.html': 			'CKEditor for Ajax',
					'index4.html': 			'Usage of the API',
					'index5.html': 			'XHTML-compliant style',
					'index6.html': 			'Read-only mode',
					'index7.html': 			'Navigation with "Tab"',
					'index8.html': 			'"DIV-based" editor',
					'index9.html': 			'Custom dialog windows',
					'index10.html': 		'Using the "Enter" key',
					'index11.html': 		'Toolbar configuration',
					'index12.html': 		'Output HTML',
					'index13.html': 		'Output for Flash'
				}
			}
		},

		breadcrumbsTpl = new CKEDITOR.template(
			'<ul>' +
				'{items}' +
			'</ul>'
		),

		breadcrumbsItemTpl = new CKEDITOR.template(
			'<li><a href="{url}">{name}</a></li>'
		),

		footerTpl = new CKEDITOR.template(
			'<div id="footer">' +
				'<hr>' +
				'Copyright &copy; 2003-{year}, ' +
				'<a href="http://cksource.com/">CKSource</a> - Frederico Knabben. All rights reserved.' +
			'</div>'
		),

		badgeNewTpl = '<span class="badge new" title="New!">&#9733;</span>',
		badgeBetaTpl = '<span class="badge beta" title="Beta">&beta;</span>',

		currentUrl = document.URL.match( /\/$/g ) ?
			'index.html'
				:
			document.URL.match( /[^\/]*\.html/g ).pop(),
		currentCategoryUrl = null,
		header, body;

	function initNavigation() {
		CKEDITOR.dom.element.createFromHtml( navigationTpl ).appendTo( body, true );
	}

	function initMenu() {
		var menu = CKEDITOR.dom.element.createFromHtml( '<div id="menu"></div>' );

		header = CKEDITOR.document.getElementsByTag( 'h1' ).getItem( 0 ),

		menu.appendTo( body, true );

		for ( var catUrl in categoryStructure ) {
			var listHtml = '';

			for ( var url in categoryStructure[ catUrl ].samples ) {
				var sample = categoryStructure[ catUrl ].samples[ url ],
					badges = '',
					name;

				if ( typeof sample == 'object' ) {
					name = sample.name;

					if ( sample.isBeta ) {
						badges += badgeBetaTpl;

						if ( url == currentUrl )
							CKEDITOR.dom.element.createFromHtml( badgeBetaTpl ).appendTo( header );
					}

					if ( sample.isNew ) {
						badges += badgeNewTpl;

						if ( url == currentUrl )
							CKEDITOR.dom.element.createFromHtml( badgeNewTpl ).appendTo( header );
					}
				} else
					name = sample;

				listHtml += categoryItemTpl.output( {
					url: url,
					name: name,
					'class': url == currentUrl ? 'current' : '',
					badges: badges
				} );

				if ( !currentCategoryUrl && url == currentUrl )
					currentCategoryUrl = catUrl;
			}

			CKEDITOR.dom.element.createFromHtml( categoryTpl.output( {
				id: catUrl,
				name: catUrl.match( /\.html$/ ) ?
						'<a href="' + catUrl + '">' + categoryStructure[ catUrl ].name + '</a>'
					:
						categoryStructure[ catUrl ].name,
				items: listHtml
			} ) ).appendTo( menu );
		}
	}

	function initBreadcrumbs() {
		var itemsHtml = breadcrumbsItemTpl.output( {
			name: 'CKEditor Samples',
			url: 'index.html'
		} );

		if ( currentCategoryUrl ) {
			itemsHtml += breadcrumbsItemTpl.output( {
				name: categoryStructure[ currentCategoryUrl ].name,
				url: '#' + currentCategoryUrl
			} );
		}

		CKEDITOR.dom.element.createFromHtml( breadcrumbsTpl.output( {
			items: itemsHtml
		} ) ).insertAfter( header );
	}

	function initFooter() {
		CKEDITOR.dom.element.createFromHtml( footerTpl.output( {
			year: new Date().getFullYear()
		} ) ).appendTo( body );
	}

	function ready() {
		body = CKEDITOR.document.getBody();

		initNavigation();
		initMenu();
		initBreadcrumbs();
		initFooter();
	}

	if ( CKEDITOR.env.ie && CKEDITOR.env.version < 9 )
		window.attachEvent( 'onload', ready );
	else
		document.addEventListener( 'DOMContentLoaded', ready, false );
})();
// %LEAVE_UNMINIFIED% %REMOVE_LINE%