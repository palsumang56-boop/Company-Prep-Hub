// Sample OA questions used to populate an empty database.
// These are classic, widely practised interview problems written in our own words;
// company tags reflect commonly reported interview topics and are for demo purposes.
// Replace them with real collected questions over time (npm run seed -- --remove deletes these).

const q = (title, companies, difficulty, topicTags, problemStatement, inputFormat, outputFormat, constraints, examples) => ({
  title,
  companies,
  difficulty,
  topicTags,
  problemStatement,
  inputFormat,
  outputFormat,
  constraints,
  examples,
});

module.exports = [
  q(
    'Two Sum Pairs',
    ['Amazon', 'Visa', 'BNY Mellon'],
    'Easy',
    ['Array', 'Hashing'],
    '<p>You are given an array of integers <code>nums</code> and an integer <code>target</code>. Find two different positions whose values add up to <code>target</code> and return those positions.</p><p>Exactly one valid pair exists. Return the smaller index first.</p>',
    'First line: n. Second line: n integers. Third line: target.',
    'Two indices separated by a space.',
    ['2 ≤ n ≤ 10^5', '-10^9 ≤ nums[i], target ≤ 10^9'],
    [{ input: 'nums = [3, 8, 11, 4], target = 7', output: '0 3', explanation: '3 + 4 = 7' }]
  ),
  q(
    'Longest Substring Without Repeating Characters',
    ['Amazon', 'Microsoft', 'MasterCard'],
    'Medium',
    ['Sliding Window', 'String', 'Hashing'],
    '<p>Given a string <code>s</code>, return the length of the longest contiguous substring in which no character appears more than once.</p>',
    'A single string s.',
    'An integer: the maximum length.',
    ['0 ≤ |s| ≤ 5 × 10^4', 's contains printable ASCII characters'],
    [
      { input: 's = "pwwkew"', output: '3', explanation: '"wke" is the longest substring with all distinct characters.' },
      { input: 's = "bbbb"', output: '1' },
    ]
  ),
  q(
    'Number of Islands',
    ['Google', 'Amazon', 'Salesforce'],
    'Medium',
    ['Graph', 'BFS', 'DFS', 'Matrix'],
    '<p>A map is given as an <code>m × n</code> grid of characters, where <code>1</code> is land and <code>0</code> is water. Cells connect horizontally or vertically (not diagonally). Count how many separate islands of land the map contains.</p>',
    'First line: m and n. Next m lines: strings of 0s and 1s.',
    'The number of islands.',
    ['1 ≤ m, n ≤ 300'],
    [{ input: 'grid = ["11000","11000","00100","00011"]', output: '3' }]
  ),
  q(
    'LRU Cache',
    ['Microsoft', 'Amazon', 'Intuit'],
    'Medium',
    ['Design', 'Hashing', 'Linked List'],
    '<p>Design a cache with a fixed <code>capacity</code> that supports two operations, each in O(1) average time:</p><ul><li><code>get(key)</code>: return the value if the key exists, otherwise -1.</li><li><code>put(key, value)</code>: insert or update the key. If the cache is full, first evict the key that was used least recently.</li></ul><p>Both <code>get</code> and <code>put</code> count as a use of the key.</p>',
    'Capacity, followed by a list of operations.',
    'The result of every get operation.',
    ['1 ≤ capacity ≤ 3000', 'Up to 2 × 10^5 operations'],
    [
      {
        input: 'capacity = 2; put(1,1), put(2,2), get(1), put(3,3), get(2), get(3)',
        output: '1, -1, 3',
        explanation: 'Adding key 3 evicts key 2, which was the least recently used.',
      },
    ]
  ),
  q(
    'Merge Overlapping Intervals',
    ['Google', 'Wells Fargo', 'Visa'],
    'Medium',
    ['Sorting', 'Intervals'],
    '<p>Given a list of intervals <code>[start, end]</code>, merge every group of overlapping intervals and return the resulting non-overlapping intervals sorted by start. Intervals that touch at an endpoint count as overlapping.</p>',
    'n, followed by n pairs of integers.',
    'The merged intervals, one per line.',
    ['1 ≤ n ≤ 10^4', '0 ≤ start ≤ end ≤ 10^4'],
    [{ input: '[[1,3],[2,6],[8,10],[10,12]]', output: '[[1,6],[8,12]]' }]
  ),
  q(
    'Maximum Subarray Sum',
    ['Deutsche Bank', 'Cisco', 'BNY Mellon'],
    'Medium',
    ['Array', 'Dynamic Programming'],
    '<p>Given an integer array that may contain negative numbers, find the contiguous non-empty subarray with the largest sum and return that sum.</p>',
    'n, then n integers.',
    'The maximum subarray sum.',
    ['1 ≤ n ≤ 10^5', '-10^4 ≤ a[i] ≤ 10^4'],
    [{ input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'The subarray [4, -1, 2, 1] has sum 6.' }]
  ),
  q(
    'Valid Brackets',
    ['Cisco', 'Media.net', 'JLR'],
    'Easy',
    ['Stack', 'String'],
    '<p>A string contains only the characters <code>( ) [ ] { }</code>. Decide whether it is balanced: every opening bracket must be closed by the same type of bracket, in the correct order.</p>',
    'A single string s.',
    '"true" or "false".',
    ['1 ≤ |s| ≤ 10^4'],
    [
      { input: 's = "{[()]}()"', output: 'true' },
      { input: 's = "([)]"', output: 'false' },
    ]
  ),
  q(
    'Top K Frequent Elements',
    ['Amazon', 'UiPath', 'Intuit'],
    'Medium',
    ['Heap', 'Hashing', 'Bucket Sort'],
    '<p>Given an integer array and an integer <code>k</code>, return the <code>k</code> values that occur most often. The answer is guaranteed to be unique; return it in any order. Aim for better than O(n log n).</p>',
    'n, the array, and k.',
    'k integers.',
    ['1 ≤ n ≤ 10^5', '1 ≤ k ≤ number of distinct values'],
    [{ input: 'nums = [4,4,4,6,6,9], k = 2', output: '[4, 6]' }]
  ),
  q(
    'Minimum Coins for Amount',
    ['Google', 'Deutsche Bank', 'Wells Fargo'],
    'Medium',
    ['Dynamic Programming'],
    '<p>You have unlimited coins of each given denomination. Return the fewest coins needed to make exactly <code>amount</code>, or -1 if it cannot be made.</p>',
    'The list of denominations, then amount.',
    'Minimum number of coins, or -1.',
    ['1 ≤ number of denominations ≤ 12', '0 ≤ amount ≤ 10^4'],
    [
      { input: 'coins = [1, 5, 6, 9], amount = 11', output: '2', explanation: '5 + 6 = 11' },
      { input: 'coins = [2], amount = 3', output: '-1' },
    ]
  ),
  q(
    'Longest Increasing Subsequence',
    ['Microsoft', 'Media.net'],
    'Medium',
    ['Dynamic Programming', 'Binary Search'],
    '<p>Return the length of the longest strictly increasing subsequence of an integer array. A subsequence keeps the original order but may skip elements. An O(n log n) solution is expected for full marks.</p>',
    'n, then n integers.',
    'The length of the longest increasing subsequence.',
    ['1 ≤ n ≤ 2.5 × 10^4'],
    [{ input: '[10, 9, 2, 5, 3, 7, 101, 18]', output: '4', explanation: 'One answer is [2, 3, 7, 18].' }]
  ),
  q(
    'Trapping Rain Water',
    ['Google', 'Amazon', 'Salesforce'],
    'Hard',
    ['Two Pointers', 'Stack', 'Array'],
    '<p>Bars of width 1 have the given heights. After it rains, water collects between taller bars. Compute the total units of water trapped.</p>',
    'n, then n non-negative heights.',
    'Total trapped water.',
    ['1 ≤ n ≤ 2 × 10^4', '0 ≤ height[i] ≤ 10^5'],
    [{ input: '[0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }]
  ),
  q(
    'Course Schedule Feasibility',
    ['UnifyApps', 'Intuit', 'Salesforce'],
    'Medium',
    ['Graph', 'Topological Sort', 'BFS'],
    '<p>There are <code>n</code> courses labelled 0 to n-1. Each prerequisite pair <code>[a, b]</code> means course b must be finished before course a. Decide whether all courses can be completed, and if so, return one valid order.</p>',
    'n, the number of pairs, then the pairs.',
    'A valid order, or an empty list if impossible.',
    ['1 ≤ n ≤ 2000', '0 ≤ pairs ≤ 5000'],
    [
      { input: 'n = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]', output: '[0, 1, 2, 3]' },
      { input: 'n = 2, prerequisites = [[0,1],[1,0]]', output: '[]', explanation: 'The two courses depend on each other.' },
    ]
  ),
  q(
    'Kth Largest Element',
    ['Visa', 'Cisco'],
    'Medium',
    ['Heap', 'Quickselect', 'Sorting'],
    '<p>Return the <code>k</code>-th largest value in an unsorted array (by sorted position, so duplicates count separately). Try to do better than fully sorting the array.</p>',
    'n, the array, and k.',
    'The k-th largest value.',
    ['1 ≤ k ≤ n ≤ 10^5'],
    [{ input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' }]
  ),
  q(
    'Rotting Oranges',
    ['Amazon', 'MasterCard', 'UnifyApps'],
    'Medium',
    ['BFS', 'Matrix'],
    '<p>In a grid, 0 is an empty cell, 1 is a fresh orange and 2 is a rotten orange. Each minute, every fresh orange next to a rotten one (up, down, left, right) becomes rotten. Return the minutes until no fresh orange remains, or -1 if some can never rot.</p>',
    'm, n, then the grid.',
    'Minutes elapsed, or -1.',
    ['1 ≤ m, n ≤ 10'],
    [{ input: '[[2,1,1],[1,1,0],[0,1,1]]', output: '4' }]
  ),
  q(
    'Product of Array Except Self',
    ['Microsoft', 'Wells Fargo', 'UiPath'],
    'Medium',
    ['Array', 'Prefix Sum'],
    '<p>Return an array where each position holds the product of every other element of the input. Do it in O(n) time without using division.</p>',
    'n, then n integers.',
    'n integers.',
    ['2 ≤ n ≤ 10^5', 'Every prefix and suffix product fits in a 32-bit integer'],
    [{ input: '[1, 2, 3, 4]', output: '[24, 12, 8, 6]' }]
  ),
  q(
    'Word Break',
    ['Google', 'Salesforce'],
    'Medium',
    ['Dynamic Programming', 'Trie', 'String'],
    '<p>Given a string <code>s</code> and a dictionary of words, decide whether <code>s</code> can be split into a sequence of one or more dictionary words. Words may be reused.</p>',
    'The string s, then the dictionary words.',
    '"true" or "false".',
    ['1 ≤ |s| ≤ 300', '1 ≤ dictionary size ≤ 1000'],
    [{ input: 's = "applepenapple", dict = ["apple", "pen"]', output: 'true' }]
  ),
  q(
    'Minimum Window Substring',
    ['Media.net', 'Microsoft'],
    'Hard',
    ['Sliding Window', 'Hashing', 'String'],
    '<p>Given strings <code>s</code> and <code>t</code>, return the shortest substring of <code>s</code> that contains every character of <code>t</code>, including duplicates. Return an empty string if none exists.</p>',
    'Two strings s and t.',
    'The minimum window, or an empty string.',
    ['1 ≤ |s|, |t| ≤ 10^5'],
    [{ input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' }]
  ),
  q(
    'Lowest Common Ancestor in a Binary Tree',
    ['Microsoft', 'Deutsche Bank', 'JLR'],
    'Medium',
    ['Tree', 'DFS', 'Recursion'],
    '<p>Given a binary tree and two of its nodes <code>p</code> and <code>q</code>, return their lowest common ancestor: the deepest node that has both as descendants. A node counts as a descendant of itself.</p>',
    'The tree in level order (null for missing children), then p and q.',
    'The value of the ancestor node.',
    ['2 ≤ number of nodes ≤ 10^5', 'All values are unique'],
    [{ input: 'tree = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4', output: '5' }]
  ),
  q(
    'Network Delay Time',
    ['Cisco', 'UnifyApps', 'Visa'],
    'Medium',
    ['Graph', 'Shortest Path', 'Heap'],
    '<p>A network has <code>n</code> nodes and directed weighted edges <code>(u, v, w)</code> meaning a signal from u reaches v after w time units. A signal starts at node <code>k</code>. Return the time until every node has received it, or -1 if some node is unreachable.</p>',
    'n, k, then the edges.',
    'The time for all nodes to receive the signal, or -1.',
    ['1 ≤ n ≤ 100', '1 ≤ edges ≤ 6000', '0 ≤ w ≤ 100'],
    [{ input: 'n = 4, k = 2, edges = [[2,1,1],[2,3,1],[3,4,1]]', output: '2' }]
  ),
  q(
    'Best Time to Buy and Sell Stock',
    ['BNY Mellon', 'MasterCard', 'Deutsche Bank'],
    'Easy',
    ['Array', 'Greedy'],
    '<p>Given daily stock prices, choose one day to buy and a later day to sell to maximise profit. Return the maximum profit, or 0 if no profit is possible.</p>',
    'n, then n prices.',
    'The maximum profit.',
    ['1 ≤ n ≤ 10^5', '0 ≤ price ≤ 10^4'],
    [{ input: '[7, 1, 5, 3, 6, 4]', output: '5', explanation: 'Buy at 1, sell at 6.' }]
  ),
  q(
    'Edit Distance',
    ['Google', 'Intuit'],
    'Hard',
    ['Dynamic Programming', 'String'],
    '<p>Return the minimum number of single-character insertions, deletions and replacements needed to turn <code>word1</code> into <code>word2</code>.</p>',
    'Two strings.',
    'The minimum number of operations.',
    ['0 ≤ |word1|, |word2| ≤ 500'],
    [{ input: 'word1 = "horse", word2 = "ros"', output: '3' }]
  ),
  q(
    'Search in a Rotated Sorted Array',
    ['UiPath', 'JLR', 'Wells Fargo'],
    'Medium',
    ['Binary Search', 'Array'],
    '<p>A sorted array of distinct integers was rotated at an unknown pivot (for example <code>[0,1,2,4,5,6,7]</code> became <code>[4,5,6,7,0,1,2]</code>). Return the index of <code>target</code>, or -1 if it is absent, in O(log n) time.</p>',
    'n, the array, and target.',
    'The index of target, or -1.',
    ['1 ≤ n ≤ 5000'],
    [{ input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' }]
  ),
  q(
    'Group Anagrams',
    ['Amazon', 'Visa', 'Salesforce'],
    'Medium',
    ['Hashing', 'String', 'Sorting'],
    '<p>Group a list of lowercase words so that words that are anagrams of each other end up in the same group. Return the groups in any order.</p>',
    'n, then n words.',
    'The groups of anagrams.',
    ['1 ≤ n ≤ 10^4', '0 ≤ word length ≤ 100'],
    [{ input: '["eat","tea","tan","ate","nat","bat"]', output: '[["eat","tea","ate"],["tan","nat"],["bat"]]' }]
  ),
  q(
    'Sliding Window Maximum',
    ['Media.net', 'Google'],
    'Hard',
    ['Deque', 'Sliding Window', 'Heap'],
    '<p>A window of size <code>k</code> slides over an array from left to right, one position at a time. Return the maximum value inside the window at each position, in O(n) total time.</p>',
    'n, the array, and k.',
    'n - k + 1 integers.',
    ['1 ≤ k ≤ n ≤ 10^5'],
    [{ input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' }]
  ),
  q(
    'Design a Rate Limiter',
    ['UnifyApps', 'Intuit'],
    'Medium',
    ['Design', 'Queue', 'Hashing'],
    '<p>Implement <code>allow(userId, timestamp)</code> for an API that lets each user make at most <code>N</code> requests in any rolling window of <code>W</code> seconds. Return true if the request is allowed (and record it), false otherwise. Timestamps arrive in non-decreasing order.</p>',
    'N, W, then a list of (userId, timestamp) calls.',
    'true or false for each call.',
    ['1 ≤ N ≤ 1000', '1 ≤ W ≤ 3600', 'Up to 10^5 calls'],
    [
      {
        input: 'N = 2, W = 10; allow(a,1), allow(a,5), allow(a,8), allow(a,12)',
        output: 'true, true, false, true',
        explanation: 'At time 12 the request at time 1 has left the 10-second window.',
      },
    ]
  ),
  q(
    'Count Subarrays With Sum K',
    ['MasterCard', 'BNY Mellon', 'UiPath'],
    'Medium',
    ['Prefix Sum', 'Hashing'],
    '<p>Count the contiguous subarrays whose elements add up to exactly <code>k</code>. Values may be negative.</p>',
    'n, the array, and k.',
    'The number of such subarrays.',
    ['1 ≤ n ≤ 2 × 10^4', '-1000 ≤ a[i] ≤ 1000'],
    [{ input: 'nums = [1, 2, 3, -2, 2], k = 3', output: '4', explanation: 'The subarrays are [1,2], [3], [2,3,-2] and [3,-2,2].' }]
  ),
  q(
    'Longest Palindromic Substring',
    ['JLR', 'Wells Fargo', 'Media.net'],
    'Medium',
    ['String', 'Dynamic Programming', 'Two Pointers'],
    '<p>Return the longest contiguous substring of <code>s</code> that reads the same forwards and backwards. If there are several, return any one.</p>',
    'A single string s.',
    'The longest palindromic substring.',
    ['1 ≤ |s| ≤ 1000'],
    [{ input: 's = "forgeeksskeegfor"', output: '"geeksskeeg"' }]
  ),
  q(
    'Serialize and Deserialize a Binary Tree',
    ['Microsoft', 'Amazon'],
    'Hard',
    ['Tree', 'BFS', 'Design'],
    '<p>Write two functions: one that converts a binary tree into a string, and one that rebuilds exactly the same tree from that string. You choose the format.</p>',
    'A binary tree.',
    'The same tree after a round trip through your string format.',
    ['0 ≤ number of nodes ≤ 10^4', '-1000 ≤ node value ≤ 1000'],
    [{ input: 'tree = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' }]
  ),
  q(
    'Minimum Meeting Rooms',
    ['Visa', 'JLR', 'UiPath'],
    'Medium',
    ['Heap', 'Intervals', 'Sorting'],
    '<p>Given meeting time intervals <code>[start, end)</code>, return the minimum number of rooms needed so that no two overlapping meetings share a room.</p>',
    'n, then n intervals.',
    'The minimum number of rooms.',
    ['1 ≤ n ≤ 10^4', '0 ≤ start < end ≤ 10^6'],
    [{ input: '[[0,30],[5,10],[15,20]]', output: '2' }]
  ),
  q(
    'Spiral Matrix Traversal',
    ['MasterCard', 'Deutsche Bank', 'Cisco'],
    'Medium',
    ['Matrix', 'Simulation'],
    '<p>Return all elements of an <code>m × n</code> matrix in spiral order: start at the top-left corner, move right, then down, then left, then up, and keep spiralling inwards.</p>',
    'm, n, then the matrix rows.',
    'The elements in spiral order.',
    ['1 ≤ m, n ≤ 10'],
    [{ input: '[[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]' }]
  ),
];
