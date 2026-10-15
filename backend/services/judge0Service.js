import logger from '../utils/logger.js';

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '',
  'X-RapidAPI-Host': process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com',
});

export const executeCode = async (sourceCode, language, stdin = '') => {
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  if (!process.env.JUDGE0_API_KEY) {
    return mockExecution(sourceCode, stdin);
  }

  const baseUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';

  const submissionRes = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin,
      cpu_time_limit: 5,
      memory_limit: 256000,
    }),
  });

  if (!submissionRes.ok) {
    const err = await submissionRes.text();
    logger.error(`Judge0 error: ${err}`);
    throw new Error('Code execution service unavailable');
  }

  const result = await submissionRes.json();

  return {
    stdout: result.stdout || '',
    stderr: result.stderr || result.compile_output || '',
    status: mapStatus(result.status?.id),
    time: parseFloat(result.time) || 0,
    memory: result.memory || 0,
  };
};

const mapStatus = (statusId) => {
  const map = {
    3: 'accepted',
    4: 'wrong_answer',
    5: 'time_limit',
    6: 'compile_error',
    11: 'runtime_error',
    13: 'runtime_error',
  };
  return map[statusId] || 'runtime_error';
};

const mockExecution = (sourceCode, stdin) => {
  try {
    if (sourceCode.includes('console.log')) {
      const match = sourceCode.match(/console\.log\((.+)\)/);
      if (match) {
        const expr = match[1].replace(/['"]/g, '');
        return { stdout: `${expr}\n`, stderr: '', status: 'accepted', time: 0.01, memory: 1024 };
      }
    }
    return { stdout: stdin || 'Mock output\n', stderr: '', status: 'accepted', time: 0.01, memory: 1024 };
  } catch {
    return { stdout: '', stderr: 'Mock runtime error', status: 'runtime_error', time: 0, memory: 0 };
  }
};

export const runTestCases = async (sourceCode, language, testCases) => {
  const results = [];
  let passed = 0;

  for (const tc of testCases) {
    const result = await executeCode(sourceCode, language, tc.input);
    const actual = (result.stdout || '').trim();
    const expected = (tc.expectedOutput || '').trim();
    const testPassed = result.status === 'accepted' && actual === expected;

    if (testPassed) passed += tc.weight || 1;

    results.push({
      input: tc.input,
      expectedOutput: expected,
      actualOutput: actual,
      passed: testPassed,
      runtime: result.time,
      memory: result.memory,
      stderr: result.stderr,
    });
  }

  const totalWeight = testCases.reduce((sum, tc) => sum + (tc.weight || 1), 0);

  return {
    results,
    testsPassed: passed,
    totalTests: totalWeight,
    allPassed: passed === totalWeight,
  };
};

export default { executeCode, runTestCases, LANGUAGE_IDS };
