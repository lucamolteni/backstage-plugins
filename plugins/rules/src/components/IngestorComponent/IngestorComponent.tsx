import React, { useCallback, useEffect, useState } from 'react';

import { useApi } from '@backstage/core-plugin-api';

import {
  Button,
  ButtonVariant,
  Card,
  CodeBlock,
  CodeBlockCode,
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  MenuToggle,
  MenuToggleElement,
  Modal,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';

import { ScoreCardApi, scoreCardApiRef } from '../../api';
import { Job, RawData, RawDataDetail } from '../../api/types';
import { useAllRawData, useRawDataDetail } from '../../useRulesClient';

type Props = {};

type DetailJobProps = {
  jobId: String;
  onClose: () => void;
};

export const IngestorComponent: React.FunctionComponent<Props> = () => {
  const scoreCardApi: ScoreCardApi = useApi(scoreCardApiRef);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [needsLoadingJobs, setNeedsLoadingJobs] = useState<boolean>(true);

  const reloadJobs = async () => {
    console.log('Fetching jobs');
    const scorecards = await scoreCardApi.getJobs();
    setJobs(scorecards.results);
  };

  useEffect(() => {
    if (needsLoadingJobs) {
      reloadJobs();
    }
    setNeedsLoadingJobs(false);
  }, [reloadJobs, scoreCardApi]);

  const [selectedJobId, setSelectedJobId] = React.useState('');
  const [selectedRawDataId, setSelectedRawDataId] = useState('');

  const [isExpanded, setIsExpanded] = React.useState(false);

  const onSelectJob = (_event: any, id: React.SetStateAction<string>) => {
    setSelectedJobId(id);
    setIsExpanded(true);
  };
  const onClose = () => {
    setIsExpanded(false);
  };

  const [isRawDataDetailVisible, setIsRawDataDetailVisible] = useState(false);

  const rawDataDetail: RawDataDetail = useRawDataDetail(
    Number(selectedJobId),
    Number(selectedRawDataId),
  ).value;

  const ModalRawDataDetail: React.FunctionComponent = () => {
    const closeModalToggle = () => {
      setIsRawDataDetailVisible(false);
    };

    return (
      <React.Fragment>
        <Modal
          title={`Data for ID #${rawDataDetail.id} created at ${rawDataDetail.createdAt}`}
          isOpen={isRawDataDetailVisible}
          onClose={closeModalToggle}
          ouiaId="BasicModal"
        >
          <CodeBlock>
            <CodeBlockCode id="code-content">
              {JSON.stringify(rawDataDetail.data, null, 2)}
            </CodeBlockCode>
          </CodeBlock>
        </Modal>
      </React.Fragment>
    );
  };

  const [isNewJobVisible, setIsNewJobVisible] = useState(false);

  const onSelectRawData = (_event: any, id: React.SetStateAction<string>) => {
    setSelectedRawDataId(id);
    setIsRawDataDetailVisible(true);
  };

  const DetailJob: React.FunctionComponent<DetailJobProps> = ({ jobId }) => {
    const rawData: RawData[] = useAllRawData(Number(jobId)).value;

    return (
      <DrawerPanelContent widths={{ '2xl': 'width_75' }}>
        <DrawerHead>
          <Title size="lg" headingLevel="h2">
            Job ID #{jobId}
          </Title>
          <DrawerActions>
            <DrawerCloseButton onClick={onClose} />
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody>
          <Flex
            spaceItems={{ default: 'spaceItemsLg' }}
            direction={{ default: 'column' }}
          >
            <FlexItem>
              <DataList
                aria-label="selectable data list example"
                selectedDataListItemId={selectedRawDataId}
                onSelectDataListItem={onSelectRawData}
              >
                {rawData.map(rd => (
                  <DataListItem
                    aria-label={`data-list-item2-in-card${rd.id}`}
                    id={String(rd.id)}
                    key={rd.id}
                  >
                    <DataListItemRow>
                      <DataListItemCells
                        dataListCells={[
                          <DataListCell key={`node` + ` ${rd.id}`}>
                            <Flex
                              spaceItems={{ default: 'spaceItemsMd' }}
                              direction={{ default: 'column' }}
                            >
                              <FlexItem>
                                {rd.id} - {rd.createdAt}
                              </FlexItem>
                            </Flex>
                          </DataListCell>,
                        ]}
                      />
                    </DataListItemRow>
                  </DataListItem>
                ))}
              </DataList>
            </FlexItem>
          </Flex>
        </DrawerPanelBody>
      </DrawerPanelContent>
    );
  };

  const [isTesting, setIsTesting] = useState(false);

  const sendTestJobRequest = useCallback(async () => {
    // don't send again while we are sending
    if (isTesting) return;
    // update state
    setIsTesting(true);

    // Not sure why I'm calling await twice here
    const response: Response = await scoreCardApi.testJob(
      Number(selectedJobId),
    );
    const jsonResponse = await response.json();
    const jsonResults = jsonResponse.results;
    console.log(jsonResponse);
    console.log(jsonResults);

    // once the request is sent, update state again
    setIsTesting(false);
    setIsRawDataDetailVisible(true);
    setSelectedRawDataId(jsonResults.id);
  }, [isTesting, selectedJobId, scoreCardApi]); // update the callback if the state changes

  const deleteJob = useCallback(async () => {
    // don't send again while we are sending
    if (isTesting) return;
    // update state
    setIsTesting(true);

    // Not sure why I'm calling await twice here
    const response: Response = await scoreCardApi.deleteJob(
      Number(selectedJobId),
    );
    console.log(response);

    // once the request is sent, update state again
    setIsTesting(false);
    setSelectedRawDataId('0');
    setNeedsLoadingJobs(true);
  }, [isTesting, selectedJobId, scoreCardApi, jobs]); // update the callback if the state changes

  const ModalNewJob: React.FunctionComponent = () => {
    const [cronValue] = useState('0/5 * * * * ?');
    const [endpointValue] = useState(
      'https://api.github.com/repos/lucamolteni/test-scorecard-repository/issues',
    );
    const [typeValue, setTypeValue] = useState('GitHub');

    const [isCreating, setIsCreating] = useState(false);

    const closeModalToggle = () => {
      setIsNewJobVisible(false);
    };

    const [dropDownOpen, setDropDownOpen] = React.useState<boolean>(false);

    const onToggle = () => {
      setDropDownOpen(!dropDownOpen);
    };

    const onSelect = (event: React.SyntheticEvent<HTMLDivElement>) => {
      setDropDownOpen(false);
      const value = (event.target as HTMLElement).textContent;
      setTypeValue(value);
    };

    const createJob = useCallback(async () => {
      // don't send again while we are sending
      if (isCreating) return;
      // update state
      setIsCreating(true);

      console.log(
        'Creating job with cron: ',
        cronValue,
        ' and endpoint: ',
        endpointValue,
        ' and type: ',
        typeValue,
      );

      // Not sure why I'm calling await twice here
      const response: Response = await scoreCardApi.createJob(
        cronValue,
        typeValue,
        endpointValue,
      );
      const jsonResponse = await response.json();
      const jsonResults = jsonResponse.results;
      console.log(jsonResponse);
      console.log(jsonResults);

      // once the request is sent, update state again
      setIsCreating(false);
      setIsNewJobVisible(false);
      setNeedsLoadingJobs(true);
    }, [isCreating, jobs]); // update the callback if the state changes

    return (
      <React.Fragment>
        <Modal
          title="Create new job"
          isOpen={isNewJobVisible}
          onClose={closeModalToggle}
          ouiaId="BasicModal"
        >
          <React.Fragment>
            <InputGroup>
              <InputGroupItem>
                <InputGroupText component="label" htmlFor="textInput-cron">
                  CRON:
                </InputGroupText>
              </InputGroupItem>
              <InputGroupItem isFill>
                <TextInput
                  id="textInput-cron"
                  aria-label="input with dropdown and button"
                  defaultValue=""
                  value={cronValue}
                />
              </InputGroupItem>
            </InputGroup>
            <InputGroup>
              <InputGroupItem>
                <InputGroupText
                  component="label"
                  htmlFor="textInput-with-dropdown"
                >
                  Endpoint:
                </InputGroupText>
              </InputGroupItem>
              <InputGroupItem>
                <Dropdown
                  isOpen={dropDownOpen}
                  onSelect={onSelect}
                  onOpenChange={(isOpen: boolean) => setDropDownOpen(isOpen)}
                  defaultValue={0}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={onToggle}
                      isExpanded={dropDownOpen}
                    >
                      {typeValue || 'Select an option'}
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem value={0} key="github">
                      GitHub
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </InputGroupItem>
              <InputGroupItem isFill>
                <TextInput
                  id="textInput-endpoint"
                  aria-label="input with dropdown and button"
                  defaultValue=""
                  value={endpointValue}
                />
              </InputGroupItem>
            </InputGroup>
            <br />
            <InputGroup>
              <InputGroupItem>
                <Button onClick={createJob} variant={ButtonVariant.primary}>
                  Create
                </Button>
              </InputGroupItem>
            </InputGroup>
          </React.Fragment>
        </Modal>
      </React.Fragment>
    );
  };

  const openModalCreateNewJob = useCallback(async () => {
    setIsNewJobVisible(true);
  }, [isNewJobVisible]);

  const drawerContent = (
    <React.Fragment>
      <Button onClick={openModalCreateNewJob}>New Job</Button>
      <ModalRawDataDetail />
      <ModalNewJob />
      <br />
      <DataList
        aria-label="selectable data list example"
        selectedDataListItemId={selectedJobId}
        onSelectDataListItem={onSelectJob}
      >
        {jobs.map(j => (
          <DataListItem
            aria-label={`data-list-item2-in-card${j.id}`}
            id={String(j.id)}
            key={j.id}
          >
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key={`node` + ` ${j.id}`}>
                    <Flex
                      spaceItems={{ default: 'spaceItemsMd' }}
                      direction={{ default: 'column' }}
                    >
                      <FlexItem>
                        <p>{j.id}</p>
                        <p>{j.type}</p>
                        <p>{j.endpoint}</p>
                      </FlexItem>
                    </Flex>
                  </DataListCell>,
                  <DataListAction
                    key="actions"
                    aria-labelledby={`inline-modifier-item${j.id}inline-modifier-action${j.id}`}
                    id={`inline-modifier-action${j.id}`}
                    aria-label="Delete"
                  >
                    <Stack>
                      <StackItem>
                        <Button
                          variant={ButtonVariant.secondary}
                          onClick={sendTestJobRequest}
                        >
                          Test
                        </Button>
                        <Button
                          variant={ButtonVariant.secondary}
                          onClick={deleteJob}
                        >
                          Delete
                        </Button>
                      </StackItem>
                    </Stack>
                  </DataListAction>,
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        ))}
      </DataList>
    </React.Fragment>
  );

  const panelContent = <DetailJob jobId={selectedJobId} onClose={onClose} />;

  return (
    <Card>
      <Drawer isStatic isExpanded={isExpanded}>
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>{drawerContent}</DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </Card>
  );
};
