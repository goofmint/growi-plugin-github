import { h, Properties } from 'hastscript';
import Async from 'react-async';
import { format } from 'timeago.js';
import type { Plugin } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

const API_ENDPOINT = 'https://api.rss2json.com/v1/api.json?';

const getRss = async({ url }: any) => {
  const res = await fetch(url);
  const json = await res.json();
  return json;
};

// {repo=weseek/growi milestone="" state=open assignee="" creator="" mentioned="" labels=test,test2 sort=created direction=desc since="" per_page=10 page=1}
interface GitHubIssueProps {
  repo: string;
  milestone?: string;
  state?: string;
  assignee?: string;
  creator?: string;
  mentioned?: string;
  labels?: string;
  sort?: string;
  direction?: string;
  since?: string;
  per_page?: number;
  page?: number;
}

const GitHubIssue = (params: GitHubIssueProps) => {
  const baseUrl = `https://api.github.com/repos/${params.repo}/issues`;
  // create query string
  const query = Object.entries(params).map(([key, value]) => {
    if (key !== 'repo' && value !== null) {
      return `${key}=${value}`;
    }
    return '';
  }).join('&');
  const url = `${baseUrl}?${query}`;
  return (
    <Async promiseFn={getRss} url={url}>
      {({ data, error, isPending }) => {
        if (isPending) return 'Loading...';
        if (error) return `Something went wrong: ${error.message}`;
        if (data) {
          return (
            <>
              <table className='table striped'>
                <tbody>
                  {data.map((item: any) => (
                    <tr key={item.id}>
                      <td><a href={item.html_url} target='_blank'>
                        {item.title}</a><br />
                        🕒 {format(item.created_at)} by {item.user.login}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          );
        }
        return null;
      }}
    </Async>
  );
};

export const gitHub = (Tag: React.FunctionComponent<any>): React.FunctionComponent<any> => {
  return ({
    children, ...props
  }) => {
    try {
      if (!props.className.match(/language-github-/)) {
        return <Tag {...props}>{children}</Tag>;
      }
      const params = JSON.parse(children);
      switch (props.className) {
        case 'language-github-issue':
          return GitHubIssue(params);
        default:
          return <Tag {...props}>{children}</Tag>;
      }
    }
    catch (err) {
      // console.error(err);
    }
    // Return the original component if an error occurs
    return (
      <Tag {...props}>{children}</Tag>
    );
  };
};

interface GrowiNode extends Node {
  name: string;
  data: {
    hProperties?: Properties;
    hName?: string;
    hChildren?: Node[] | { type: string, value: string, url?: string }[];
    [key: string]: any;
  };
  type: string;
  attributes: {[key: string]: string}
  children: GrowiNode[] | { type: string, value: string, url?: string }[];
  value: string;
  title?: string;
  url?: string;
}

export const githubPlugin: Plugin = () => {
  return (tree: Node) => {
    visit(tree, 'leafDirective', (node: Node) => {
      const n = node as unknown as GrowiNode;
      if (n.name !== 'github') return;
      const data = n.data || (n.data = {});
      const type = n.children[0].value;
      data.hName = 'code';
      // data.classList.add(`language-github-${type}`);
      data.hProperties = { className: `language-github-${type}` };
      data.hChildren = [{ type: 'text', value: JSON.stringify(n.attributes) }];
    });
  };
};
