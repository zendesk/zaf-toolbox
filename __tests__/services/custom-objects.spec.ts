import {
    ICreateCustomObjectRecordBody,
    CustomObjectFieldType,
    ListCutomObjectRecordsSortingOptions,
    RecordBulkAction,
    IBulkJobBodyCreate
} from "@models/custom-objects";
import { CustomObjectService } from "@services/index";
import { Client } from "@zendesk/sell-zaf-app-toolbox";

describe("CustomObjectService", () => {
    const requestMock = jest.fn();
    const getMock = jest.fn();

    const service = new CustomObjectService({
        request: requestMock,
        get: getMock
    } as unknown as Client);

    describe("CustomObject", () => {
        it("should call list with the correct parameters", async () => {
            requestMock.mockResolvedValueOnce([]);

            await service.listCustomObjects();

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects`,
                type: "GET",
                contentType: "application/json"
            });
        });

        it("should call Get one Custom object with the correct parameters", async () => {
            requestMock.mockResolvedValueOnce({});

            await service.getCustomObject("foo");

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo`,
                type: "GET",
                contentType: "application/json"
            });
        });

        it("should return undefined if custom object doesn't exist", async () => {
            requestMock.mockRejectedValueOnce({ error: true });

            const result = await service.getCustomObject("foo");

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo`,
                type: "GET",
                contentType: "application/json"
            });
            expect(result).toBeUndefined();
        });

        it("should call create with the correct parameters", async () => {
            requestMock.mockResolvedValueOnce({});

            const body = {
                "key": "foo",
                "title": "Foo Object",
                "title_pluralized": "Foo Objects"
            };
            await service.createCustomObject(body);

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    custom_object: body
                })
            });
        });

        it("should call delete with the correct key", async () => {
            requestMock.mockResolvedValueOnce({});

            await service.deleteCustomObject("foo");

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo`,
                type: "DELETE",
                contentType: "application/json"
            });
        });
    });

    describe("CustomObjectField", () => {
        it("should call list with the correct parameters", async () => {
            requestMock.mockResolvedValueOnce([]);

            await service.listCustomObjectField("foo");

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/fields`,
                type: "GET",
                contentType: "application/json",
                data: {
                    include_standard_fields: false
                }
            });
        });

        it("should call list with the correct parameters and standard fields if requested", async () => {
            requestMock.mockResolvedValueOnce([]);

            await service.listCustomObjectField("foo", true);

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/fields`,
                type: "GET",
                contentType: "application/json",
                data: {
                    include_standard_fields: true
                }
            });
        });

        it("should call create with the correct parameters", async () => {
            requestMock.mockResolvedValueOnce({});

            const body = {
                "key": "foo",
                "title": "Foo Object",
                "type": CustomObjectFieldType.Text
            };
            await service.createCustomObjectField("foo", body);

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/fields`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    custom_object_field: body
                })
            });
        });

        it("should call delete with the correct key", async () => {
            requestMock.mockResolvedValueOnce({});

            await service.deleteCustomObjectField("foo", "foo_2");

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/fields/foo_2`,
                type: "DELETE",
                contentType: "application/json"
            });
        });
    });

    describe("CustomObjectRecords", () => {
        const customObjectRecord = {
            "url": "https://relate2023.zendesk.com/api/v2/custom_objects/zendesk_labs_notifications_template/records/01HQP8RM83JFAWAB958EV16F14.json",
            "id": "01HQP8RM83JFAWAB958EV16F14",
            "name": "z3n_ceweshowcase_testing",
            "custom_object_key": "zendesk_labs_notifications_template",
            "custom_object_fields": {
                "channels":
                    '[{"id":"integrationId","channel_type":"whatsapp","template_status":"PENDING","template_id":"613617220836466"},{"id":"integrationId2","channel_type":"whatsapp","template_status":"APPROVED","template_id":"613617220836466"}]',
                "created_at": "2024-02-27T00:00:00+00:00",
                "created_by": "15209377944077",
                "sent_at": "",
                "name": "z3n_ceweshowcase_testing",
                "template":
                    '{"name":"z3n_ceweshowcase_testing","components":[{"type":"BODY","text":"ToaddonceIconfirmsyntaxofhowtocreatewhatsapptemplate."}],"message":"","language":"en","status":"APPROVED","category":"MARKETING","id":"613617220836466"}'
            },
            "created_by_user_id": "15209377944077",
            "updated_by_user_id": "15209377944077",
            "created_at": "2024-02-27T21:50:35Z",
            "updated_at": "2024-02-27T21:50:35Z",
            "external_id": ""
        };

        it("should call list with the correct parameters", async () => {
            requestMock.mockResolvedValueOnce({ custom_object_records: [customObjectRecord] });

            await service.listCustomObjectRecords("foo");

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/records`,
                type: "GET",
                contentType: "application/json"
            });
        });

        it("should call list with one parameters", async () => {
            requestMock.mockResolvedValueOnce({ custom_object_records: [customObjectRecord] });

            await service.listCustomObjectRecords("foo", { sort: ListCutomObjectRecordsSortingOptions.ID });

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/records`,
                type: "GET",
                contentType: "application/json",
                data: {
                    sort: "id"
                }
            });
        });

        it("should call get with correct informations", async () => {
            requestMock.mockResolvedValueOnce({
                "custom_object_record": customObjectRecord
            });

            await service.getCustomObjectRecord("foo", "record_id");

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/records/record_id`,
                type: "GET",
                contentType: "application/json"
            });
        });

        it("should call create with the correct parameters", async () => {
            requestMock.mockResolvedValueOnce({
                "custom_object_record": customObjectRecord
            });

            const body = {
                name: "foo",
                custom_object_fields: {
                    test: "true"
                },
                external_id: "12345"
            } as unknown as ICreateCustomObjectRecordBody<Record<string, string>>;
            await service.createCustomObjectRecord("foo", body);

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/records`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    custom_object_record: body
                })
            });
        });

        it("should call update with the correct parameters", async () => {
            requestMock.mockResolvedValueOnce({
                "custom_object_record": customObjectRecord
            });

            const body = {
                name: "foo",
                custom_object_fields: {
                    test: "false"
                }
            } as unknown as ICreateCustomObjectRecordBody<Record<string, string>>;
            await service.updateCustomObjectRecord("foo", "record_id", body);

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/records/record_id`,
                type: "PATCH",
                contentType: "application/json",
                data: JSON.stringify({
                    custom_object_record: body
                })
            });
        });

        it("should call set by external id with the correct parameters", async () => {
            requestMock.mockResolvedValueOnce({
                "custom_object_record": customObjectRecord
            });

            const body = {
                name: "foo",
                custom_object_fields: {
                    test: "false"
                }
            } as unknown as ICreateCustomObjectRecordBody<Record<string, string>>;
            await service.setCustomObjectRecordByExternalId("foo", body, "external_id");

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/records?external_id=external_id`,
                type: "PATCH",
                contentType: "application/json",
                data: JSON.stringify({
                    custom_object_record: {
                        name: body.name,
                        custom_object_fields: body.custom_object_fields,
                        external_id: "external_id"
                    }
                })
            });
        });

        it("should call delete with the correct key", async () => {
            requestMock.mockResolvedValueOnce({});

            await service.deleteCustomObjectRecord("foo", "record_id");

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/records/record_id`,
                type: "DELETE",
                contentType: "application/json"
            });
        });

        it("should call Zendesk API multiple times if has more is true", async () => {
            requestMock
                .mockResolvedValueOnce({
                    custom_object_records: [customObjectRecord],
                    meta: {
                        has_more: true,
                        after_cursor: "1"
                    }
                })
                .mockResolvedValueOnce({
                    custom_object_records: [customObjectRecord],
                    meta: {
                        has_more: false
                    }
                });

            await service.retrieveAllCustomObjectRecords("foo");

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: `/api/v2/custom_objects/foo/records`,
                type: "GET",
                contentType: "application/json",
                data: {}
            });
            expect(requestMock).toHaveBeenNthCalledWith(2, {
                url: `/api/v2/custom_objects/foo/records`,
                type: "GET",
                contentType: "application/json",
                data: {
                    page: {
                        after: "1"
                    }
                }
            });
            expect(requestMock).toHaveBeenCalledTimes(2);
        });
        it("should call Zendesk API only once if has more is false", async () => {
            requestMock.mockResolvedValueOnce({
                custom_object_records: [customObjectRecord],
                meta: {
                    has_more: false
                }
            });

            await service.retrieveAllCustomObjectRecords("foo");

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: `/api/v2/custom_objects/foo/records`,
                type: "GET",
                contentType: "application/json",
                data: {}
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });

        it("should call Zendesk API with search query", async () => {
            requestMock.mockResolvedValueOnce({
                custom_object_records: [customObjectRecord],
                meta: {
                    has_more: false
                }
            });

            await service.searchRecords("foo", "search_query");

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: `/api/v2/custom_objects/foo/records/search`,
                type: "GET",
                contentType: "application/json",
                data: {
                    query: "search_query"
                }
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });

        it("should call Zendesk API with filter correctly", async () => {
            requestMock.mockResolvedValueOnce({
                custom_object_records: [customObjectRecord],
                meta: {
                    has_more: false
                }
            });

            const filter = {
                filter: {
                    "$and": [
                        {
                            "custom_object_fields.color": {
                                "$eq": "Red"
                            }
                        }
                    ]
                }
            };
            await service.filterRecords("foo", filter);

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: `/api/v2/custom_objects/foo/records/search`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(filter)
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });

        it("should call Zendesk API with filter correctly and keep filter on threw pages", async () => {
            requestMock
                .mockResolvedValueOnce({
                    custom_object_records: [customObjectRecord],
                    meta: {
                        has_more: true,
                        after_cursor: "1"
                    }
                })
                .mockResolvedValueOnce({
                    custom_object_records: [customObjectRecord],
                    meta: {
                        has_more: false
                    }
                });

            const filter = {
                filter: {
                    "$and": [
                        {
                            "custom_object_fields.color": {
                                "$eq": "Red"
                            }
                        }
                    ]
                }
            };
            await service.filterRecords("foo", filter);

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: `/api/v2/custom_objects/foo/records/search`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(filter)
            });
            expect(requestMock).toHaveBeenNthCalledWith(2, {
                url: `/api/v2/custom_objects/foo/records/search`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    ...filter,
                    page: {
                        after: "1"
                    }
                })
            });
            expect(requestMock).toHaveBeenCalledTimes(2);
        });

        it("should return only first page of records if fetchAllPages is false", async () => {
            const mockResponse = {
                count: 300,
                custom_object_records: [customObjectRecord],
                meta: {
                    has_more: true,
                    after_cursor: "1"
                }
            };
            requestMock.mockResolvedValueOnce(mockResponse);

            const filter = {
                filter: {
                    "$and": [
                        {
                            "custom_object_fields.color": {
                                "$eq": "Red"
                            }
                        }
                    ]
                }
            };
            const res = await service.filterRecords("foo", filter, false);

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: `/api/v2/custom_objects/foo/records/search`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(filter)
            });
            expect(res).toStrictEqual(mockResponse);
        });

        it("should keep sort threw all pages ", async () => {
            requestMock
                .mockResolvedValueOnce({
                    custom_object_records: [customObjectRecord],
                    meta: {
                        has_more: true,
                        after_cursor: "1"
                    }
                })
                .mockResolvedValueOnce({
                    custom_object_records: [customObjectRecord],
                    meta: {
                        has_more: false
                    }
                });

            await service.retrieveAllCustomObjectRecords("foo", { sort: ListCutomObjectRecordsSortingOptions.ID });

            expect(requestMock).toHaveBeenNthCalledWith(1, {
                url: `/api/v2/custom_objects/foo/records`,
                type: "GET",
                contentType: "application/json",
                data: {
                    sort: "id"
                }
            });
            expect(requestMock).toHaveBeenNthCalledWith(2, {
                url: `/api/v2/custom_objects/foo/records`,
                type: "GET",
                contentType: "application/json",
                data: {
                    page: {
                        after: "1"
                    },
                    sort: "id"
                }
            });
            expect(requestMock).toHaveBeenCalledTimes(2);
        });

        it("should call Zendesk API for bulk jobs correctly", async () => {
            requestMock.mockResolvedValueOnce({
                "job_status": {
                    "id": "V3-291e720c98aef4d953563ab090486213",
                    "message": null,
                    "progress": null,
                    "results": null,
                    "status": "queued",
                    "total": 2,
                    "url": "https://test.zendesk.com/api/v2/job_statuses/V3-291e720c98aef4d953563ab090486213.json"
                }
            });

            const body: IBulkJobBodyCreate = {
                "job": {
                    "action": RecordBulkAction.create,
                    "items": [
                        {
                            "custom_object_fields": {
                                "color": "Red",
                                "year": "2020"
                            },
                            "name": "2020 Tesla"
                        },
                        {
                            "custom_object_fields": {
                                "color": "Blue",
                                "external_id": "ddd444",
                                "year": "2012"
                            },
                            "name": "2012 Toyota"
                        },
                        {
                            "custom_object_fields": {
                                "color": "Silver",
                                "external_id": "ddd445",
                                "year": "2017"
                            },
                            "name": "2017 Ford"
                        }
                    ]
                }
            };
            await service.bulkJobsForRecords("foo", body);

            expect(requestMock).toHaveBeenCalledWith({
                url: `/api/v2/custom_objects/foo/jobs`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(body)
            });
            expect(requestMock).toHaveBeenCalledTimes(1);
        });
    });
});
