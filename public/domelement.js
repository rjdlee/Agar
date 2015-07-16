/*

A DOM elment with an image source or a background color

*/

function DOMElement( x, y, width, height, tagName, className, parentElement, text )
{
	this.el;
	this.pos = new Vector( -1, -1 );
	this.width;
	this.height;
	this.zIndex;

	this.create( tagName, className, parentElement, text );
	this.draw( x, y, width, height );
}

// Create a new DOM elment with the <tagName class='className'> and append to its parentElement
DOMElement.prototype.create = function ( tagName, className, parentElement, text )
{
	this.el = document.createElement( tagName );
	this.el.className = className;

	if ( text )
	{
		var textNode = document.createTextNode( text );
		this.el.appendChild( textNode );
	}

	parentElement.appendChild( this.el );
};

// Set the element's background color
DOMElement.prototype.color = function ( hue )
{

	this.el.style.backgroundColor = 'hsl(' + hue + ', 50%, 95%)';
	this.el.style.borderColor = 'hsl(' + hue + ', 50%, 80%)';
};

// Set the element's src attribute
DOMElement.prototype.img = function ( url )
{

	this.el.style.backgroundImage = 'url(' + url + ')';
};

// Remove the element from the DOM
DOMElement.prototype.delete = function ()
{

	this.el.parentNode.removeChild( this.el );
};

// Set position, width, and height
DOMElement.prototype.draw = function ( x, y, width, height )
{
	if ( this.x !== x )
	{
		this.el.style.left = x + 'px';
		this.x = x;
	}

	if ( this.y !== y )
	{
		this.el.style.top = y + 'px';
		this.y = y;
	}

	if ( this.width !== width )
	{
		this.el.style.width = width + 'px';
		this.width = width;
	}

	if ( this.height !== height )
	{
		this.el.style.height = height + 'px';
		this.height = height;

		// Change z-index depending on height
		this.el.style.zIndex = height;
	}
};