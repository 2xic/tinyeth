import { FieldNode } from '../ast/FieldNode';
import { Node } from '../ast/Node';

export function recursiveAddFieldNodes({
  currentNode,
  fieldNode,
}: {
  currentNode: Node;
  fieldNode: FieldNode;
}) {
  currentNode?.nodes.forEach((item) => {
    if (item instanceof FieldNode) {
      // TODO, this should only transfer field nodes.
      fieldNode.add(item);
    } else {
      recursiveAddFieldNodes({
        currentNode: item,
        fieldNode,
      });
    }
  });
}
