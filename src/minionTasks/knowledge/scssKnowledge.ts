export const scssKnowledge = `
1. File Organization: SCSS brings in the ability of splitting a large CSS file into smaller, more manageable files. This makes the code more readable, maintainable, and organized.

Example:

# scss
// abstracts
@import 'abstracts/variables';
@import 'abstracts/functions';
@import 'abstracts/mixins';

// base
@import 'base/reset';
@import 'base/typography';

// components
@import 'components/buttons';
@import 'components/covers';
@import 'components/cards';
#
2. Naming Conventions: Use a consistent convention such as BEM (Block, Element, Modifier). This allows you to understand the purpose of specific styles from their names alone.

Example:

# scss
.block {}
.block__element {}
.block--modifier {}
#

3. Variables: Use variables for frequent values like colors, fonts, etc. This allows easy modification and provides consistency across the site.

Example:

# scss
$base-color: #c6538c;

body {
  color: $base-color;
}
#

4. Nesting: Make use of nesting cautiously. Nesting selectors can be helpful but excessive nesting can lead to over-specified CSS and nightmares in maintenance.

Example:

# scss
nav {
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li { 
    display: inline-block; 
  }

  a {
    display: block;
    padding: 0 10px;
    text-decoration: none;
  }
}
#

5. Mixins: Mixins allow you to make groups of CSS declarations that you want to reuse. This is an effective way to keep your SCSS DRY (Don't Repeat Yourself).

Example:

# scss
@mixin transform($property) {
  -webkit-transform: $property;
  -ms-transform: $property;
  transform: $property;
}

.box { @include transform(rotate(30deg)); }
#

6. Extend/Inheritance: The @extend directive allows one selector to inherit the styles of another selector. It helps to keep your SCSS DRY and well-organised.

Example:

# scss
%message-shared {
  border: 1px solid #ccc;
  padding: 10px;
  color: #333;
}

.success {
  @extend %message-shared;
  border-color: green;
}
#

7. Operator: SCSS has mathematical operators like +, -, *, / and %. This brings great convenience to size calculations in your stylesheets.

Example:

# scss
.content {
  width: 80% / 2; // Outputs 'width: 40%;'
}
#

8. Commenting: Make sure you comment on your SCSS code, especially when you create mixins or complex code blocks. It helps others to understand what they do.

Example:

# scss
// This is a wrapper mixin
@mixin wrapper {
  max-width:1040px; 
  width:100%;
  margin:0 auto; 
}
#

By adhering to these principles, you can write clean, maintainable, and well-organized SCSS code.`.trim();
