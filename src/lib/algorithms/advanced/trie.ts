/**
 * Trie (Prefix Tree)
 * Efficient string storage and retrieval
 * Time: O(m) where m is word length
 * Space: O(ALPHABET_SIZE * m * n)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { TrieInput, TrieData, AdvancedSnapshot, TrieNode } from '../../types/advanced';

let nodeIdCounter = 0;

function createTrieNode(char: string, depth: number): TrieNode {
  return {
    id: `trie-node-${nodeIdCounter++}`,
    char,
    children: new Map(),
    isEndOfWord: false,
    state: 'default',
    depth,
  };
}

function insertWord(root: TrieNode, word: string, snapshots: AdvancedSnapshot<TrieData>[], step: { count: number }, allWords: string[]) {
  let current = root;
  
  snapshots.push({
    id: `trie-${step.count++}`,
    step: snapshots.length,
    description: `Inserting word: "${word}"`,
    data: {
      root: cloneTrieNode(root),
      words: allWords,
      currentWord: word,
      operation: 'Inserting',
    },
    currentLine: 1,
    variables: { word, length: word.length },
  });

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    
    if (!current.children.has(char)) {
      current.children.set(char, createTrieNode(char, current.depth + 1));
      
      snapshots.push({
        id: `trie-${step.count++}`,
        step: snapshots.length,
        description: `Created new node for '${char}' at depth ${current.depth + 1}`,
        data: {
          root: cloneTrieNode(root),
          words: allWords,
          currentWord: word.substring(0, i + 1),
          operation: 'Inserting',
        },
        currentLine: 2,
        variables: { char, depth: current.depth + 1, position: i },
      });
    }
    
    current = current.children.get(char)!;
    current.state = 'path';
  }
  
  current.isEndOfWord = true;
  current.state = 'word';
  
  snapshots.push({
    id: `trie-${step.count++}`,
    step: snapshots.length,
    description: `Word "${word}" inserted. Marked end of word.`,
    data: {
      root: cloneTrieNode(root),
      words: allWords,
      currentWord: word,
      operation: 'Insert complete',
    },
    currentLine: 3,
    variables: { word },
  });
}

function cloneTrieNode(node: TrieNode): TrieNode {
  const cloned: TrieNode = {
    ...node,
    children: new Map(),
  };
  
  node.children.forEach((child, key) => {
    cloned.children.set(key, cloneTrieNode(child));
  });
  
  return cloned;
}

function generateTrie(input: TrieInput): AdvancedSnapshot<TrieData>[] {
  const { words, operation = 'insert' } = input;
  const snapshots: AdvancedSnapshot<TrieData>[] = [];
  const step = { count: 0 };
  nodeIdCounter = 0;

  const root = createTrieNode('', 0);

  snapshots.push({
    id: `trie-${step.count++}`,
    step: snapshots.length,
    description: 'Created empty trie with root node',
    data: {
      root: cloneTrieNode(root),
      words: [],
      operation: 'Initialized',
    },
    currentLine: 0,
    variables: { wordCount: 0 },
  });

  const insertedWords: string[] = [];
  
  for (const word of words) {
    insertedWords.push(word);
    insertWord(root, word, snapshots, step, insertedWords);
  }

  snapshots.push({
    id: `trie-${step.count++}`,
    step: snapshots.length,
    description: `Trie construction complete. Inserted ${words.length} words.`,
    data: {
      root: cloneTrieNode(root),
      words: insertedWords,
      operation: 'Complete',
    },
    currentLine: 4,
    variables: { totalWords: words.length, nodes: nodeIdCounter },
  });

  return snapshots;
}

export const trieDataStructure: AlgorithmDefinition<TrieInput, TrieData> = {
  id: 'trie-data-structure',
  name: 'Trie (Prefix Tree)',
  category: 'advanced',
  categoryName: 'Advanced Data Structures',
  description: 'Tree-like data structure for efficient string storage and retrieval. Each node represents a character. Supports fast prefix search and autocomplete functionality.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(m)',
    average: 'O(m)',
    worst: 'O(m)',
  },
  spaceComplexity: 'O(ALPHABET_SIZE × m × n)',
  code: [
    'Insert(word):',
    '  current = root',
    '  for char in word:',
    '    if char not in current.children:',
    '      create new node',
    '    current = current.children[char]',
    '  current.isEndOfWord = true',
  ],
  defaultInput: {
    words: ['cat', 'car', 'card', 'dog', 'dodge'],
  },
  inputConfig: { type: 'array' },
  generate: generateTrie,
};
