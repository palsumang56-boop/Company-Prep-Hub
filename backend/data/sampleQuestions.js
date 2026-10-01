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

  // ---- Second batch: 15 more companies, 5 questions each ----
  q(
    'Reverse a Linked List',
    ['Qualcomm', 'Samsung', 'Oracle'],
    'Easy',
    ['Linked List', 'Recursion'],
    '<p>Given the head of a singly linked list, reverse the list in place and return the new head. Write both an iterative and a recursive version.</p>',
    'The list values in order (empty for an empty list).',
    'The values of the reversed list.',
    ['0 ≤ number of nodes ≤ 5000', '-5000 ≤ node value ≤ 5000'],
    [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }]
  ),
  q(
    'Majority Element',
    ['Walmart', 'PhonePe', 'Arcesium'],
    'Easy',
    ['Array', 'Hashing', 'Counting'],
    '<p>An array of size <code>n</code> is guaranteed to contain one value that appears more than <code>⌊n / 2⌋</code> times. Return that value. Can you do it in O(n) time with O(1) extra space?</p>',
    'n, then n integers.',
    'The majority value.',
    ['1 ≤ n ≤ 5 × 10^4', '-10^9 ≤ a[i] ≤ 10^9'],
    [{ input: 'nums = [2,2,1,1,1,2,2]', output: '2', explanation: '2 appears 4 times out of 7.' }]
  ),
  q(
    'Climbing Stairs',
    ['Goldman Sachs', 'JPMorgan Chase', 'Qualcomm'],
    'Easy',
    ['Dynamic Programming', 'Math'],
    '<p>A staircase has <code>n</code> steps. Each move climbs either 1 or 2 steps. In how many distinct ways can you reach the top?</p>',
    'A single integer n.',
    'The number of distinct ways.',
    ['1 ≤ n ≤ 45'],
    [
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2 and 2+1.' },
      { input: 'n = 5', output: '8' },
    ]
  ),
  q(
    'Find the Unpaired Element',
    ['Qualcomm', 'Samsung'],
    'Easy',
    ['Bit Manipulation', 'Array'],
    '<p>Every value in a non-empty array appears exactly twice, except for one value that appears once. Find that value in O(n) time using O(1) extra space.</p>',
    'n, then n integers.',
    'The value that appears once.',
    ['1 ≤ n ≤ 3 × 10^4', 'n is odd'],
    [{ input: 'nums = [4,1,2,1,2]', output: '4', explanation: '1 and 2 each appear twice.' }]
  ),
  q(
    'Min Stack',
    ['Adobe', 'Atlassian', 'Walmart'],
    'Easy',
    ['Stack', 'Design'],
    '<p>Design a stack that supports <code>push(x)</code>, <code>pop()</code>, <code>top()</code> and <code>getMin()</code>, where <code>getMin()</code> returns the smallest element currently in the stack. Every operation must run in O(1) time.</p>',
    'A list of operations.',
    'The result of every top and getMin call.',
    ['-2^31 ≤ x ≤ 2^31 - 1', 'pop, top and getMin are only called on a non-empty stack', 'Up to 3 × 10^4 operations'],
    [
      {
        input: 'push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()',
        output: '-3, 0, -2',
        explanation: 'After popping -3, the smallest remaining value is -2.',
      },
    ]
  ),
  q(
    'Container With Most Water',
    ['Goldman Sachs', 'Adobe'],
    'Medium',
    ['Two Pointers', 'Greedy', 'Array'],
    '<p>You are given <code>n</code> vertical lines, where line <code>i</code> has height <code>height[i]</code>. Choose two lines that, together with the x-axis, form a container holding the most water. Return that amount: the distance between the lines times the shorter height.</p>',
    'n, then n heights.',
    'The maximum amount of water.',
    ['2 ≤ n ≤ 10^5', '0 ≤ height[i] ≤ 10^4'],
    [{ input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Lines at index 1 (height 8) and index 8 (height 7): 7 × 7 = 49.' }]
  ),
  q(
    'Three Sum to Zero',
    ['Flipkart', 'Morgan Stanley', 'Uber'],
    'Medium',
    ['Two Pointers', 'Sorting', 'Array'],
    '<p>Return every unique triplet <code>[a, b, c]</code> of values taken from three different positions of the array with <code>a + b + c = 0</code>. The answer must not contain the same triplet twice.</p>',
    'n, then n integers.',
    'The triplets, in any order.',
    ['3 ≤ n ≤ 3000', '-10^5 ≤ a[i] ≤ 10^5'],
    [{ input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' }]
  ),
  q(
    'Jump Game Reachability',
    ['Zomato', 'PhonePe'],
    'Medium',
    ['Greedy', 'Array'],
    '<p>You start at index 0 of an array of non-negative integers. The value at each index is the longest jump you can make from there. Decide whether you can reach the last index.</p>',
    'n, then n integers.',
    '"true" or "false".',
    ['1 ≤ n ≤ 10^4', '0 ≤ a[i] ≤ 10^5'],
    [
      { input: 'nums = [2,3,1,1,4]', output: 'true', explanation: 'Jump 1 step to index 1, then 3 steps to the end.' },
      { input: 'nums = [3,2,1,0,4]', output: 'false', explanation: 'Every route lands on index 3, whose value is 0.' },
    ]
  ),
  q(
    'House Robber',
    ['JPMorgan Chase', 'Walmart', 'DE Shaw'],
    'Medium',
    ['Dynamic Programming', 'Array'],
    '<p>Houses along a street hold the given amounts of money. You may rob any set of houses as long as no two robbed houses are next to each other. Return the largest total you can collect.</p>',
    'n, then n amounts.',
    'The maximum amount.',
    ['1 ≤ n ≤ 100', '0 ≤ amount ≤ 400'],
    [{ input: 'money = [2,7,9,3,1]', output: '12', explanation: 'Rob houses 0, 2 and 4: 2 + 9 + 1 = 12.' }]
  ),
  q(
    'Unique Paths With Obstacles',
    ['Samsung', 'Morgan Stanley'],
    'Medium',
    ['Dynamic Programming', 'Matrix'],
    '<p>A robot starts at the top-left cell of an <code>m × n</code> grid and may only move right or down. Cells marked 1 are blocked and cells marked 0 are open. Count the distinct paths to the bottom-right cell.</p>',
    'm, n, then the grid.',
    'The number of paths.',
    ['1 ≤ m, n ≤ 100', 'The answer fits in a 32-bit integer'],
    [{ input: 'grid = [[0,0,0],[0,1,0],[0,0,0]]', output: '2', explanation: 'Go around the blocked centre cell, either above it or below it.' }]
  ),
  q(
    'Longest Common Subsequence',
    ['DE Shaw', 'Oracle', 'Goldman Sachs'],
    'Medium',
    ['Dynamic Programming', 'String'],
    '<p>Return the length of the longest sequence of characters that appears in both <code>text1</code> and <code>text2</code> in the same order, though not necessarily next to each other.</p>',
    'Two strings.',
    'The length of the longest common subsequence.',
    ['1 ≤ |text1|, |text2| ≤ 1000', 'Lowercase English letters only'],
    [
      { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'The common subsequence is "ace".' },
      { input: 'text1 = "abc", text2 = "def"', output: '0' },
    ]
  ),
  q(
    'Partition Equal Subset Sum',
    ['Arcesium', 'Adobe'],
    'Medium',
    ['Dynamic Programming', 'Knapsack'],
    '<p>Decide whether an array of positive integers can be split into two groups with equal sums. Every element must go into exactly one group.</p>',
    'n, then n integers.',
    '"true" or "false".',
    ['1 ≤ n ≤ 200', '1 ≤ a[i] ≤ 100'],
    [
      { input: 'nums = [1,5,11,5]', output: 'true', explanation: '[1, 5, 5] and [11] both sum to 11.' },
      { input: 'nums = [1,2,3,5]', output: 'false' },
    ]
  ),
  q(
    'Minimum Eating Speed',
    ['Flipkart', 'Zomato'],
    'Medium',
    ['Binary Search'],
    '<p>There are <code>n</code> piles of bananas and you have <code>h</code> hours. Each hour you choose one pile and eat up to <code>k</code> bananas from it; if the pile has fewer, you finish it and wait for the next hour. Return the smallest integer <code>k</code> that lets you finish every pile within <code>h</code> hours.</p>',
    'n, the pile sizes, and h.',
    'The minimum speed k.',
    ['1 ≤ n ≤ 10^4', 'n ≤ h ≤ 10^9', '1 ≤ pile ≤ 10^9'],
    [
      { input: 'piles = [3,6,7,11], h = 8', output: '4', explanation: 'At speed 4 the piles take 1 + 2 + 2 + 3 = 8 hours.' },
      { input: 'piles = [30,11,23,4,20], h = 5', output: '30' },
    ]
  ),
  q(
    'Detect the Start of a Cycle in a Linked List',
    ['Qualcomm', 'Oracle'],
    'Medium',
    ['Linked List', 'Two Pointers'],
    '<p>A singly linked list may contain a cycle: the last node points back to an earlier node instead of to null. Return the index of the node where the cycle begins, or -1 if there is no cycle. Use O(1) extra memory.</p><p><code>pos</code> is only used to build the test list; it is not passed to your function.</p>',
    'The list values, then pos: the index the tail links back to (-1 for no cycle).',
    'The index where the cycle starts, or -1.',
    ['0 ≤ number of nodes ≤ 10^4', '-10^5 ≤ node value ≤ 10^5'],
    [{ input: 'head = [3,2,0,-4], pos = 1', output: '1', explanation: 'The tail links back to the node with value 2.' }]
  ),
  q(
    'Binary Tree Level Order Traversal',
    ['Atlassian', 'Walmart', 'JPMorgan Chase'],
    'Medium',
    ['Tree', 'BFS'],
    '<p>Return the values of a binary tree level by level, left to right within each level, as a list of lists.</p>',
    'The tree in level order (null for missing children).',
    'One list of values per level.',
    ['0 ≤ number of nodes ≤ 2000', '-1000 ≤ node value ≤ 1000'],
    [{ input: 'tree = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }]
  ),
  q(
    'Validate a Binary Search Tree',
    ['Adobe', 'Oracle'],
    'Medium',
    ['Tree', 'DFS', 'Binary Search Tree'],
    '<p>Decide whether a binary tree is a valid binary search tree: for every node, every value in its left subtree is strictly smaller and every value in its right subtree is strictly larger. Comparing each node only with its direct children is not enough.</p>',
    'The tree in level order (null for missing children).',
    '"true" or "false".',
    ['1 ≤ number of nodes ≤ 10^4', '-2^31 ≤ node value ≤ 2^31 - 1'],
    [
      { input: 'tree = [2,1,3]', output: 'true' },
      { input: 'tree = [5,4,6,null,null,3,7]', output: 'false', explanation: '3 is in the right subtree of 5 but is smaller than 5.' },
    ]
  ),
  q(
    'Number of Provinces',
    ['Uber', 'PhonePe', 'Arcesium'],
    'Medium',
    ['Graph', 'Union Find', 'DFS'],
    '<p>There are <code>n</code> cities, and <code>isConnected[i][j] = 1</code> means cities i and j are directly linked. A province is a group of cities linked directly or through other cities, with no links to cities outside the group. Return the number of provinces.</p>',
    'n, then the n × n matrix.',
    'The number of provinces.',
    ['1 ≤ n ≤ 200', 'isConnected[i][i] = 1', 'isConnected[i][j] = isConnected[j][i]'],
    [{ input: 'isConnected = [[1,1,0],[1,1,0],[0,0,1]]', output: '2', explanation: 'Cities 0 and 1 form one province; city 2 is on its own.' }]
  ),
  q(
    'Cheapest Flights Within K Stops',
    ['Uber', 'Flipkart'],
    'Medium',
    ['Graph', 'Shortest Path', 'BFS'],
    '<p>There are <code>n</code> cities and a list of one-way flights <code>[from, to, price]</code>. Return the cheapest price from <code>src</code> to <code>dst</code> using at most <code>k</code> stops in between, or -1 if no such route exists.</p>',
    'n, the flights, src, dst and k.',
    'The cheapest price, or -1.',
    ['1 ≤ n ≤ 100', '1 ≤ price ≤ 10^4', '0 ≤ k < n', 'No duplicate flights'],
    [
      {
        input: 'n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1',
        output: '700',
        explanation: '0 → 1 → 3 costs 700. The cheaper route 0 → 1 → 2 → 3 (400) needs 2 stops.',
      },
    ]
  ),
  q(
    'Implement a Trie',
    ['Atlassian', 'Zomato'],
    'Medium',
    ['Trie', 'Design', 'String'],
    '<p>Build a prefix tree with three operations:</p><ul><li><code>insert(word)</code>: add a word.</li><li><code>search(word)</code>: return true if exactly this word was inserted.</li><li><code>startsWith(prefix)</code>: return true if any inserted word begins with the prefix.</li></ul>',
    'A list of operations.',
    'The result of every search and startsWith call.',
    ['1 ≤ |word|, |prefix| ≤ 2000', 'Lowercase English letters only', 'Up to 3 × 10^4 operations'],
    [
      {
        input: 'insert("apple"), search("apple"), search("app"), startsWith("app"), insert("app"), search("app")',
        output: 'true, false, true, true',
      },
    ]
  ),
  q(
    'Daily Temperatures',
    ['Morgan Stanley', 'PhonePe'],
    'Medium',
    ['Stack', 'Monotonic Stack', 'Array'],
    '<p>Given daily temperatures, return an array where position <code>i</code> holds how many days you must wait after day <code>i</code> for a warmer temperature, or 0 if no warmer day follows. Aim for O(n).</p>',
    'n, then n temperatures.',
    'n integers.',
    ['1 ≤ n ≤ 10^5', '30 ≤ temperature ≤ 100'],
    [{ input: 'temps = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' }]
  ),
  q(
    'Decode Ways',
    ['Goldman Sachs', 'Arcesium', 'Qualcomm'],
    'Medium',
    ['Dynamic Programming', 'String'],
    '<p>Letters are encoded as numbers: A = 1, B = 2, …, Z = 26. Given a string of digits, count the ways it can be decoded back into letters. A group with a leading zero, such as "06", is not a valid code.</p>',
    'A string of digits.',
    'The number of decodings.',
    ['1 ≤ |s| ≤ 100', 'The answer fits in a 32-bit integer'],
    [
      { input: 's = "226"', output: '3', explanation: '"BZ" (2 26), "VF" (22 6) and "BBF" (2 2 6).' },
      { input: 's = "06"', output: '0' },
    ]
  ),
  q(
    'Generate Balanced Parentheses',
    ['Samsung', 'JPMorgan Chase'],
    'Medium',
    ['Backtracking', 'Recursion', 'String'],
    '<p>Given <code>n</code>, list every balanced string made of <code>n</code> pairs of parentheses. Return them in any order.</p>',
    'A single integer n.',
    'All balanced strings.',
    ['1 ≤ n ≤ 8'],
    [{ input: 'n = 3', output: '["((()))","(()())","(())()","()(())","()()()"]' }]
  ),
  q(
    'Task Scheduler With Cooldown',
    ['Atlassian', 'Uber'],
    'Medium',
    ['Greedy', 'Heap', 'Hashing'],
    '<p>A CPU runs tasks labelled with letters, one per time unit, and may also sit idle. Two runs of the same task must be separated by at least <code>n</code> units. Tasks can run in any order. Return the minimum number of units needed to finish them all.</p>',
    'The list of tasks, then n.',
    'The minimum number of time units.',
    ['1 ≤ number of tasks ≤ 10^4', '0 ≤ n ≤ 100', 'Tasks are uppercase letters'],
    [{ input: 'tasks = ["A","A","A","B","B","B"], n = 2', output: '8', explanation: 'A B idle A B idle A B' }]
  ),
  q(
    'Longest Consecutive Sequence',
    ['Zomato', 'Walmart', 'Morgan Stanley'],
    'Medium',
    ['Hashing', 'Array'],
    '<p>Given an unsorted integer array, return the length of the longest run of consecutive values (like 4, 5, 6, 7) that all appear in the array, in any positions. Solve it in O(n) time.</p>',
    'n, then n integers.',
    'The length of the longest run.',
    ['0 ≤ n ≤ 10^5', '-10^9 ≤ a[i] ≤ 10^9'],
    [{ input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'The run is 1, 2, 3, 4.' }]
  ),
  q(
    'Median of Two Sorted Arrays',
    ['Goldman Sachs', 'DE Shaw'],
    'Hard',
    ['Binary Search', 'Divide and Conquer', 'Array'],
    '<p>Given two sorted arrays of sizes <code>m</code> and <code>n</code>, return the median of all their values combined, in O(log(min(m, n))) time.</p>',
    'Two sorted arrays.',
    'The median, as a decimal.',
    ['0 ≤ m, n ≤ 1000', '1 ≤ m + n ≤ 2000', '-10^6 ≤ value ≤ 10^6'],
    [
      { input: 'a = [1,3], b = [2]', output: '2.0' },
      { input: 'a = [1,2], b = [3,4]', output: '2.5', explanation: 'Combined they are [1,2,3,4], so the median is (2 + 3) / 2.' },
    ]
  ),
  q(
    'Merge K Sorted Lists',
    ['Flipkart', 'Oracle', 'Uber'],
    'Hard',
    ['Heap', 'Linked List', 'Divide and Conquer'],
    '<p>You are given <code>k</code> linked lists, each sorted in ascending order. Merge them into one sorted list and return it in O(N log k) time, where N is the total number of nodes.</p>',
    'k, then each list.',
    'The merged list.',
    ['0 ≤ k ≤ 10^4', '0 ≤ total nodes ≤ 10^4', '-10^4 ≤ node value ≤ 10^4'],
    [{ input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }]
  ),
  q(
    'Binary Tree Maximum Path Sum',
    ['DE Shaw', 'Adobe'],
    'Hard',
    ['Tree', 'DFS', 'Dynamic Programming'],
    '<p>A path in a binary tree is a sequence of nodes where each neighbouring pair is joined by an edge and no node repeats. It does not have to pass through the root. Return the largest sum of node values along any non-empty path.</p>',
    'The tree in level order (null for missing children).',
    'The maximum path sum.',
    ['1 ≤ number of nodes ≤ 3 × 10^4', '-1000 ≤ node value ≤ 1000'],
    [{ input: 'tree = [-10,9,20,null,null,15,7]', output: '42', explanation: 'The path 15 → 20 → 7 sums to 42.' }]
  ),
  q(
    'Word Ladder',
    ['Zomato', 'Atlassian', 'Flipkart'],
    'Hard',
    ['Graph', 'BFS', 'String'],
    '<p>Turn <code>beginWord</code> into <code>endWord</code> by changing one letter at a time, where every word after the first must be in <code>wordList</code>. Return the number of words in the shortest such sequence, counting both ends, or 0 if it cannot be done.</p>',
    'beginWord, endWord, then the word list.',
    'The length of the shortest sequence, or 0.',
    ['1 ≤ word length ≤ 10', '1 ≤ wordList size ≤ 5000', 'All words have the same length'],
    [
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
        output: '5',
        explanation: 'hit → hot → dot → dog → cog',
      },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0', explanation: '"cog" is not in the list.' },
    ]
  ),
  q(
    'Largest Rectangle in Histogram',
    ['Morgan Stanley', 'DE Shaw', 'Samsung'],
    'Hard',
    ['Stack', 'Monotonic Stack', 'Array'],
    '<p>Bars of width 1 have the given heights. Return the area of the largest rectangle that fits entirely inside the histogram.</p>',
    'n, then n heights.',
    'The largest area.',
    ['1 ≤ n ≤ 10^5', '0 ≤ height ≤ 10^4'],
    [{ input: 'heights = [2,1,5,6,2,3]', output: '10', explanation: 'The bars of height 5 and 6 hold a rectangle of width 2 and height 5.' }]
  ),
  q(
    'Count Inversions',
    ['Arcesium', 'JPMorgan Chase', 'PhonePe'],
    'Hard',
    ['Merge Sort', 'Divide and Conquer', 'Array'],
    '<p>An inversion is a pair of positions <code>i &lt; j</code> with <code>a[i] &gt; a[j]</code>. Count the inversions in the array in O(n log n) time. The count can exceed the 32-bit range.</p>',
    'n, then n integers.',
    'The number of inversions.',
    ['1 ≤ n ≤ 10^5', '1 ≤ a[i] ≤ 10^9'],
    [
      { input: 'nums = [8,4,2,1]', output: '6', explanation: 'Every pair is out of order.' },
      { input: 'nums = [2,4,1,3,5]', output: '3', explanation: 'The pairs are (2,1), (4,1) and (4,3).' },
    ]
  ),
];
