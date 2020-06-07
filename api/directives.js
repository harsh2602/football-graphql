const { SchemaDirectiveVisitor } = require("apollo-server");
const { defaultFieldResolver, GraphQLString } = require("graphql");
const dateFormat = require("date-fns/format");

const formatDate = (timestamp, format) => dateFormat(timestamp, format);

class FormatDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver;
    const { format: defaultFormat } = this.args;

    // Pass the field level argument
    field.args.push({
      name: "format",
      type: GraphQLString,
    });

    field.resolve = async (root, { format, ...rest }, ctx, info) => {
      const result = await resolver.call(this, root, rest, ctx, info);
      return formatDate(result, format || defaultFormat);
    };

    field.type = GraphQLString; // If in case the field is not a string
  }
}

module.exports = { FormatDateDirective };
