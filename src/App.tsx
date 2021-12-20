import { useCallback, useEffect, useState } from "react";

import "@nosferatu500/react-sortable-tree/style.css";
import SortableTree from "@nosferatu500/react-sortable-tree";
import api from "./services/api";

type Account = {
  company_id: string;
  id: string;
  code: number;
  name: string;
  level: number;
  parent_id: string;
  type: string;
  accounts: Account[];
};

type TreeItem = {
  id: string;
  title: string;
  subtitle: string;
  children: TreeItem[];
  account: Account;
};

type handleMoveNodeProps = {
  node: TreeItem;
  nextParentNode: TreeItem;
  path?: string[];
};

function App() {
  const [treeData, setTreeData] = useState<TreeItem[]>([] as TreeItem[]);

  const proccessAccountToTreeItem = useCallback((item: Account): TreeItem => {
    return {
      id: item.id,
      title: item.name,
      children: item.accounts
        ? item.accounts.map<TreeItem>((item) => proccessAccountToTreeItem(item))
        : [],
      subtitle: item.code.toString(),
      account: item,
    };
  }, []);

  useEffect(() => {
    api
      .get<Account[]>(
        "/accounts?code=1&_embed=accounts"
        //"/financial-accounts/company/c967e6b3-2458-483b-898b-ce069a2fc3b6"
      )
      .then(({ data }) => {
        const values: TreeItem[] = data.map((item: Account) =>
          proccessAccountToTreeItem(item)
        );

        setTreeData(values);
      });
  }, [proccessAccountToTreeItem]);

  const handleChangeItem = (newTreeData: any) => {
    setTreeData(newTreeData);
  };

  const handleMoveNode = ({
    node,
    nextParentNode,
    path = [],
    ...rest
  }: handleMoveNodeProps) => {
    // api.put(`/financial-accounts/${node.id}`, {
    //   ...node.account,
    //   level: path.length,
    //   parent_id: nextParentNode ? nextParentNode.id : null,
    //   FinancialAccount: node.children,
    // });

    api.put(`/accounts/${node.id}`, {
      ...node.account,
      level: path.length,
      parent_id: nextParentNode ? nextParentNode.id : null,
      FinancialAccount: node.children,
    });
  };

  return (
    <>
      <h1>Plano de Contas</h1>
      <div style={{ height: 400 }}>
        <SortableTree
          treeData={treeData}
          onChange={handleChangeItem}
          onMoveNode={handleMoveNode}
          getNodeKey={({ node }) => node.id}
          maxDepth={5}
          generateNodeProps={({ node, path }) => ({
            title: (
              <form
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div>
                  {node.title}
                  <button>Add</button>
                  <button>Remove</button>
                </div>
                {/* <Button size='mini' basic color='blue' circular icon='add' onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.insertNewNode(path) }} />
                <Button size='mini' basic color='blue' circular icon='trash' onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.removeNode(path) }} /> */}
              </form>
            ),
            subtitle: <p>Código Analítico: {node.subtitle}</p>,
          })}
        />
      </div>
    </>
  );
}

export default App;
